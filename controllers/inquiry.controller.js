import { validationResult } from "express-validator";
import Inquiry from "../models/Inquiry.models.js";
import nodemailer from "nodemailer";
import crypto from "crypto"; // Unique Ticket ID generate karne ke liye

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

    // Premium Touch: Generate a unique alphanumeric Ticket ID for the Client Portal
    const ticketId = `TSX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // ── STEP A: DATABASE ME ENTRY SAVE KAREN ──
    // Note: Apne Inquiry model me 'ticketId' field zaroor add kar lena (String type)
    const newInquiry = await Inquiry.create({
      ticketId,
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

    // 🏢 PORTAL URL (Change this to your actual frontend domain)
    const portalUrl = `https://techsolex.com/portal/ticket/${ticketId}`;

    // [TEMPLATE 1] Premium Branded Admin HTML Template
    const adminHtmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #020921; padding: 24px; text-align: center; border-bottom: 3px solid #2563eb;">
          <h2 style="color: #ffffff; margin: 0; font-size: 22px;">🚀 New High-Value Lead Dropped</h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">TechSolex — CRM ENGINE</p>
        </div>
        
        <div style="padding: 24px; color: #0f172a;">
          <p style="font-size: 15px; margin-top: 0; color: #475569;">Hey Admin, a new project inquiry has been logged. CRM Ticket allocated: <strong>${ticketId}</strong></p>
          
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
      </div>
    `;

    // [TEMPLATE 2] Client Acknowledgement Template (With Portal Button)
    const clientHtmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #020921; padding: 24px; text-align: center; border-bottom: 3px solid #2563eb;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">💼 Inquiry Successfully Logged</h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">TechSolex — Enterprise Infrastructure</p>
        </div>
        
        <div style="padding: 24px; color: #0f172a; line-height: 1.6;">
          <p style="font-size: 15px; margin-top: 0; color: #334155;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #475569;">Thank you for reaching out to TechSolex. We have successfully initialized your secure project ticket: <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #2563eb;">${ticketId}</code>.</p>
          
          <p style="font-size: 14px; color: #475569;">Our engineering team is already evaluating your technical requirements for <strong>${serviceInterest.toUpperCase()}</strong>. We aim to align our solutions with your vision within 12–24 business hours.</p>
          
          <!-- 🚀 CLIENT CRM PORTAL BUTTON -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
              Track Project via TechSolex Portal
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; font-style: italic;">Note: You can also reply directly to this email if you have any additional asset files or briefs to attach.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 13px; margin-bottom: 0; color: #64748b;">Best Coordinates,<br><strong style="color: #020921;">TechSolex Operations Desk</strong></p>
        </div>

        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">This is an automated system dispatch. Security encrypted by TechSolex Infrastructure.</p>
        </div>
      </div>
    `;

    const adminMailOptions = {
      from: `"TechSolex CRM Engine" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      replyTo: email,
      subject: `🚨 [Lead ${ticketId}] New Inquiry: ${name} - ${serviceInterest}`,
      html: adminHtmlTemplate,
    };

    const clientMailOptions = {
      from: `"TechSolex Architecture" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Secure confirmation of your project inquiry [${ticketId}] - TechSolex`,
      html: clientHtmlTemplate,
    };

    // 🔥 VERCEL SAFE: Executing parallel non-blocking mailers
    try {
      await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(clientMailOptions),
      ]);
      console.log(
        `📨 TechSolex Engine: Dispatched Ticket ${ticketId} to Admin & Client.`,
      );
    } catch (mailError) {
      console.error("❌ Nodemailer SMTP Engine Failure:", mailError);
    }

    res.status(201).json({
      success: true,
      message:
        "Inquiry secure log completed. Enterprise templates transmitted.",
      ticketId: ticketId,
      data: newInquiry,
    });
  } catch (error) {
    next(error);
  }
};
