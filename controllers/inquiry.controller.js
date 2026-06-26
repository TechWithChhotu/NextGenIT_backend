import { validationResult } from "express-validator";
import Inquiry from "../models/Inquiry.models.js";
import nodemailer from "nodemailer";

export const createInquiry = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name,
      email,
      phone,
      serviceInterest,
      estimatedBudget,
      description,
    } = req.body;

    // ── STEP A: DATABASE ME ENTRY SAVE KAREN ──
    const newInquiry = await Inquiry.create({
      name,
      email,
      phone,
      serviceInterest,
      estimatedBudget,
      description,
    });

    // ── STEP B: EMAIL SENT SYSTEM NODEMAILER ──
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Premium Branded HTML Email Template
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #020921; padding: 24px; text-align: center; border-bottom: 3px solid #2563eb;">
          <h2 style="color: #ffffff; margin: 0; font-size: 22px;">🚀 New High-Value Lead Dropped</h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">TechSolex — CRM ENGINE</p>
        </div>
        
        <div style="padding: 24px; color: #0f172a;">
          <p style="font-size: 15px; margin-top: 0; color: #475569;">Hey Admin, a new project inquiry has been logged via the dynamic web portal. Here are the configuration details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; font-size: 13px; color: #64748b; width: 35%; border-bottom: 1px solid #f1f5f9;">CLIENT NAME:</td>
              <td style="padding: 10px; font-size: 14px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">EMAIL ADDRESS:</td>
              <td style="padding: 10px; font-size: 14px; color: #2563eb; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">PHONE NUMBER:</td>
              <td style="padding: 10px; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${phone || "Not Provided"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">SERVICE REQUESTED:</td>
              <td style="padding: 10px; font-size: 13px; font-weight: bold; font-family: monospace; color: #ffffff; background-color: #2563eb; display: inline-block; margin: 6px 0; padding: 3px 8px; border-radius: 4px;">// ${serviceInterest.toUpperCase()}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">ESTIMATED BUDGET:</td>
              <td style="padding: 10px; font-size: 14px; font-weight: bold; color: #16a34a; border-bottom: 1px solid #f1f5f9;">${estimatedBudget}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin-top: 20px; border-radius: 0 8px 8px 0;">
            <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">PROJECT DESCRIPTION & REQUIREMENT:</h4>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #334155;">"${description}"</p>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">This is an automated system notification generated securely from TechSOlex Infrastructure.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"TechSolex Leads" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      replyTo: email,
      subject: `🚨 New Lead: ${name} - ${serviceInterest}`,
      html: htmlTemplate,
    };

    // 🔥 5. FIXED FOR VERCEL: Callback hata kar try-catch ke saath await lagaya
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("📨 Alert Email Dispatched Cleanly:", info.messageId);
    } catch (mailError) {
      // Agar email fail bhi ho jaye, toh humara app crash nahi hoga aur DB log safe rahega
      console.error("❌ Nodemailer SMTP Error Failure:", mailError);
    }

    // Ab client ko response bhejein (Serverless function ab safely close ho sakta hai)
    res.status(201).json({
      success: true,
      message:
        "Inquiry successfully securely logged and notification email triggered.",
      data: newInquiry,
    });
  } catch (error) {
    next(error);
  }
};
