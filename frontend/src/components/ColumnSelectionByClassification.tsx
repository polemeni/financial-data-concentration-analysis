interface ColumnSelectionByClassificationProps {
  title: string;
  columns: string[];
  selectedColumns: string[];
  onGroupByColumnToggle: (column: string) => void;
}

const ColumnSelectionByClassification: React.FC<
  ColumnSelectionByClassificationProps
> = ({ title, columns, selectedColumns, onGroupByColumnToggle }) => {
  return (
    <div className="column-selection">
      <h3>{title}</h3>
      <p>Select categorical columns to group your data by:</p>
      <div className="columns-grid">
        {columns?.map(col => (
          <div
            key={col}
            className={`column-item ${selectedColumns.includes(col) ? 'selected' : ''}`}
            onClick={() => onGroupByColumnToggle(col)}
          >
            <span className="column-name">{col}</span>
            {selectedColumns.includes(col) && (
              <span className="checkmark">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColumnSelectionByClassification;
