import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { generatePixPayload } from "@/lib/pix";
import { formatCurrency, formatDocument } from "@/lib/format";
import { InvoiceActions } from "@/components/invoice-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [invoice, settings] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { client: true, project: true },
    }),
    getSettings(),
  ]);

  if (!invoice) notFound();

  // Gera o Pix Copia e Cola + QR Code, se houver chave configurada
  let pixCode: string | null = null;
  let qrDataUrl: string | null = null;

  if (settings.pixKey) {
    pixCode = generatePixPayload({
      pixKey: settings.pixKey,
      merchantName: settings.name || "Recebedor",
      merchantCity: settings.city || "Brasil",
      amount: invoice.amount,
      txid: invoice.txid || "***",
    });
    qrDataUrl = await QRCode.toDataURL(pixCode, {
      margin: 1,
      width: 240,
      errorCorrectionLevel: "M",
    });
  }

  return (
    <div>
      <Link
        href="/invoices"
        className="no-print inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <InvoiceActions
        invoiceId={invoice.id}
        status={invoice.status}
        pixCode={pixCode}
      />

      {/* Recibo imprimível */}
      <div className="print-area max-w-2xl mx-auto bg-white text-zinc-900 rounded-xl border border-border p-8 shadow-sm">
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-zinc-200">
          <div>
            <h1 className="text-xl font-bold">{settings.name || "Configure seus dados"}</h1>
            {settings.document && (
              <p className="text-sm text-zinc-500">
                {formatDocument(settings.document)}
              </p>
            )}
            {settings.city && (
              <p className="text-sm text-zinc-500">{settings.city}</p>
            )}
            {settings.email && (
              <p className="text-sm text-zinc-500">{settings.email}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500">Recibo</p>
            <p className="text-2xl font-bold">
              #{invoice.number.toString().padStart(4, "0")}
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              {formatDate(invoice.issuedAt)}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
            Cobrado de
          </p>
          <p className="font-semibold">{invoice.client.name}</p>
          {invoice.client.document && (
            <p className="text-sm text-zinc-500">
              {formatDocument(invoice.client.document)}
            </p>
          )}
          {invoice.client.email && (
            <p className="text-sm text-zinc-500">{invoice.client.email}</p>
          )}
        </div>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-wide text-zinc-400 mb-2">
            Descrição
          </p>
          <div className="flex justify-between items-start py-3 border-t border-zinc-200">
            <p className="text-sm pr-4">{invoice.description}</p>
            <p className="font-semibold whitespace-nowrap">
              {formatCurrency(invoice.amount)}
            </p>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-zinc-900">
            <p className="font-bold">Total</p>
            <p className="text-xl font-bold">{formatCurrency(invoice.amount)}</p>
          </div>
          {invoice.dueDate && (
            <p className="text-sm text-zinc-500 mt-2">
              Vencimento: {formatDate(invoice.dueDate)}
            </p>
          )}
        </div>

        {/* Seção Pix */}
        {qrDataUrl && pixCode ? (
          <div className="pt-6 border-t border-zinc-200">
            <p className="text-xs uppercase tracking-wide text-zinc-400 mb-3">
              Pague com Pix
            </p>
            <div className="flex items-center gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Code Pix"
                width={140}
                height={140}
                className="rounded-lg border border-zinc-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-600 mb-2">
                  Escaneie o QR Code ou use o Pix Copia e Cola:
                </p>
                <p className="text-xs font-mono break-all bg-zinc-100 p-2 rounded border border-zinc-200 text-zinc-700">
                  {pixCode}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-print pt-6 border-t border-zinc-200">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-sm">
                Configure sua chave Pix em{" "}
                <Link href="/settings" className="underline font-medium">
                  Configurações
                </Link>{" "}
                para gerar o QR Code de cobrança neste recibo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
