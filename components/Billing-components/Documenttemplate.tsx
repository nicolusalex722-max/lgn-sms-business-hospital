import { COMPANY } from "@/lib/data";
import { computeTotals, formatDateDMY, formatTZS, lineTotal } from "@/lib/utils";
import type { BillingDocument } from "@/lib/types";

export default function DocumentTemplate({ doc }: { doc: BillingDocument }) {
  const { subtotal, tax, total, amountPaid, balanceDue } = computeTotals(doc);
  const isInvoice = doc.type === "invoice";
  const heading = isInvoice ? "INVOICE" : "BILL";
  const partyLabel = isInvoice ? "Bill To" : "Supplier";
  const signatureLeft = isInvoice ? "Authorized By" : "Received By";
  const signatureRight = isInvoice ? "Customer" : "Supplier";

  return (
    <div className="bg-white p-10 text-slate-900" id="billing-print-area">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500 text-lg font-bold text-white">
          {COMPANY.name.slice(0, 1)}
        </div>
        <h1 className="text-2xl font-bold tracking-wide text-indigo-600">{heading}</h1>
      </div>

      <div className="mb-6">
        <p className="text-base font-bold text-slate-900">{COMPANY.name}</p>
        <p className="text-sm text-slate-600">{COMPANY.branch}</p>
        <p className="text-sm text-slate-600">
          Phone: {COMPANY.phone} • Email: {COMPANY.email}
        </p>
        {COMPANY.address.map((line) => (
          <p key={line} className="text-sm text-slate-600">
            {line}
          </p>
        ))}
        <p className="text-sm text-slate-600">Website: {COMPANY.website}</p>
      </div>

      <div className="mb-6">
        <p className="text-base font-bold text-slate-900">
          {isInvoice ? "Invoice" : "Bill"} Number: {doc.number}
        </p>
        <p className="text-sm text-slate-600">
          {isInvoice ? "Invoice" : "Bill"} Date: {formatDateDMY(doc.date)}
        </p>
        <p className="text-sm text-slate-600">Due Date: {formatDateDMY(doc.dueDate)}</p>
      </div>

      <div className="mb-6">
        <p className="text-base font-bold text-slate-900">{partyLabel}</p>
        <p className="text-sm text-slate-700">{doc.partyName}</p>
        {(doc.partyPhone || doc.partyEmail) && (
          <p className="text-sm text-slate-600">
            {doc.partyPhone && `Phone: ${doc.partyPhone}`}
            {doc.partyPhone && doc.partyEmail && " • "}
            {doc.partyEmail && `Email: ${doc.partyEmail}`}
          </p>
        )}
      </div>

      <table className="mb-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-2">No.</th>
            <th className="py-2 pr-2">Item</th>
            <th className="py-2 pr-2 text-right">Qty</th>
            <th className="py-2 pr-2 text-right">Unit Price</th>
            <th className="py-2 pr-2 text-right">Discount</th>
            <th className="py-2 pr-0 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((item, idx) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-2.5 pr-2 text-slate-500">{idx + 1}</td>
              <td className="py-2.5 pr-2 font-medium text-slate-800">{item.description}</td>
              <td className="py-2.5 pr-2 text-right text-slate-600">{item.qty}</td>
              <td className="py-2.5 pr-2 text-right text-slate-600">
                {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2.5 pr-2 text-right text-slate-600">
                {item.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2.5 pr-0 text-right font-medium text-slate-800">
                {lineTotal(item).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-8 flex justify-end">
        <div className="w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium text-slate-800">{formatTZS(subtotal)}</span>
          </div>
          {doc.taxRate > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">VAT / Tax ({doc.taxRate}%)</span>
              <span className="font-medium text-slate-800">{formatTZS(tax)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-300 pt-1.5 text-base">
            <span className="font-bold text-slate-900">Total</span>
            <span className="font-bold text-slate-900">{formatTZS(total)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">Amount Paid</span>
            <span className="font-medium text-emerald-600">{formatTZS(amountPaid)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-700">Balance Due</span>
            <span className={`font-bold ${balanceDue > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {formatTZS(balanceDue)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-8">
        <div className="border-t border-slate-400 pt-2 text-sm text-slate-500">{signatureLeft}</div>
        <div className="border-t border-slate-400 pt-2 text-sm text-slate-500">{signatureRight}</div>
      </div>

      <div className="mt-16 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span>
          {COMPANY.name} • {doc.number}
        </span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}