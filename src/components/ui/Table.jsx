export default function Table({ columns, rows, renderRow }) {
  return (
    <div className="glass-panel overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-white/[0.07]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-5 py-4 text-left text-xs font-extrabold uppercase tracking-[0.14em] text-slate-300"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row, index) => renderRow(row, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
