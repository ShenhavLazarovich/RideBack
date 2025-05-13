import { z } from "zod";

export const theftReportSchema = z.object({
  id: z.number(),
  bikeId: z.number(),
  userId: z.number(),
  theftDate: z.date(),
  theftLocation: z.string(),
  theftDetails: z.string().optional(),
  policeReported: z.boolean().default(false),
  policeStation: z.string().optional(),
  policeFileNumber: z.string().optional(),
  contactName: z.string(),
  contactPhone: z.string(),
  contactEmail: z.string().email().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
  status: z.enum(["stolen", "closed", "found"]).default("stolen"),
  createdAt: z.date(),
  updatedAt: z.date(),
  latitude: z.string(),
  longitude: z.string(),
}); 