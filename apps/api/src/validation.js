import { z } from "zod";

export const incidentSeverity = ["low", "medium", "high", "critical"];
export const incidentStatus = ["open", "investigating", "resolved"];

export const createIncidentSchema = z.object({
  title: z.string().trim().min(5, "Informe um título com ao menos 5 caracteres."),
  service: z.string().trim().min(2, "Informe o serviço afetado."),
  severity: z.enum(incidentSeverity),
  reporter: z.string().trim().min(3, "Informe o responsável pelo reporte."),
  description: z.string().trim().min(15, "Descreva o incidente com mais detalhes."),
  assignee: z.string().trim().min(3).optional().or(z.literal(""))
});

export const updateIncidentSchema = z.object({
  status: z.enum(incidentStatus),
  assignee: z.string().trim().min(3).optional().or(z.literal("")),
  resolutionSummary: z.string().trim().min(10).optional().or(z.literal(""))
}).superRefine((value, ctx) => {
  if (value.status === "resolved" && !value.resolutionSummary) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["resolutionSummary"],
      message: "Informe um resumo da resolução ao encerrar o incidente."
    });
  }
});
