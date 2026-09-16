import { useState } from "react";
import ExercisePicker from "./ExercisePicker.jsx";

const emptyBlock = () => ({ rounds: 3, rest: 60, exercises: [] });

// Pretty-print a day so it can be pasted straight into plan.js.
export function toPlanJson(workout) {
  const q = (v) => (v == null || v === "" ? "null" : JSON.stringify(v));
  const lines = [];
  lines.push("  {");
  lines.push(`    day: ${workout.day},`);
  lines.push(`    title: ${q(workout.title)},`);
  lines.push(`    focus: ${q(workout.focus)},`);
  lines.push("    blocks: [");
  for (const b of workout.blocks) {
    lines.push("      {");
    lines.push(`        rounds: ${b.rounds || 1},`);
    lines.push(`        rest: ${b.rest ? b.rest : "null"},`);
    lines.push("        exercises: [");
    for (const e of b.exercises) {
      lines.push(
        `          { name: ${q(e.name)}, id: ${q(e.id)}, reps: ${q(e.reps)}, note: ${q(e.note)} },`
      );
    }
    lines.push("        ],");
    lines.push("      },");
  }
  lines.push("    ],");
  lines.push("  },");
  return lines.join("\n");
}

export default function Builder({ workout, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => structuredClone(workout));
  const [pickerFor, setPickerFor] = useState(null); // block index
  const [copied, setCopied] = useState(false);

  const update = (fn) => setDraft((d) => { const next = structuredClone(d); fn(next); return next; });

  const setBlock = (bi, key, value) => update((d) => { d.blocks[bi][key] = value; });
  const setEx = (bi, ei, key, value) => update((d) => { d.blocks[bi].exercises[ei][key] = value; });

  const addBlock = () => update((d) => d.blocks.push(emptyBlock()));
  const removeBlock = (bi) => update((d) => d.blocks.splice(bi, 1));
  const removeEx = (bi, ei) => update((d) => d.blocks[bi].exercises.splice(ei, 1));

  const addExercise = (ex) => {
    const bi = pickerFor;
    setPickerFor(null);
    update((d) => d.blocks[bi].exercises.push(ex));
  };

  const copyJson = async () => {
    const text = toPlanJson(draft);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Copy this into plan.js:", text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="builder">
      <div className="sheet-head">
        <div className="sheet-title">Build Day {draft.day}</div>
        <button className="sheet-close" onClick={onCancel}>×</button>
      </div>

      <div className="builder-body">
        <div className="b-block">
          <div className="b-ex-row">
            <input
              className="b-input"
              placeholder="Workout title"
              value={draft.title || ""}
              onChange={(e) => update((d) => { d.title = e.target.value; })}
            />
          </div>
          <div className="b-ex-row">
            <input
              className="b-input"
              placeholder="Focus (optional)"
              value={draft.focus || ""}
              onChange={(e) => update((d) => { d.focus = e.target.value; })}
            />
          </div>
        </div>

        {draft.blocks.map((block, bi) => (
          <div className="b-block" key={bi}>
            <div className="b-block-head">
              <label className="b-field">
                <input
                  className="b-input num"
                  type="number"
                  min="1"
                  value={block.rounds}
                  onChange={(e) => setBlock(bi, "rounds", Number(e.target.value) || 1)}
                />
                rounds
              </label>
              <label className="b-field">
                <input
                  className="b-input num"
                  type="number"
                  min="0"
                  step="15"
                  value={block.rest ?? 0}
                  onChange={(e) => setBlock(bi, "rest", Number(e.target.value) || null)}
                />
                sec rest
              </label>
              <button className="b-del" onClick={() => removeBlock(bi)}>Remove block</button>
            </div>

            {block.exercises.map((ex, ei) => (
              <div className="b-ex" key={ei}>
                <div className="b-ex-row">
                  <input
                    className="b-input"
                    value={ex.name}
                    onChange={(e) => setEx(bi, ei, "name", e.target.value)}
                  />
                  <input
                    className="b-input reps"
                    placeholder="reps"
                    value={ex.reps || ""}
                    onChange={(e) => setEx(bi, ei, "reps", e.target.value)}
                  />
                  <button className="b-del" onClick={() => removeEx(bi, ei)}>✕</button>
                </div>
                <div className="b-ex-row">
                  <input
                    className="b-input"
                    placeholder="note (optional)"
                    value={ex.note || ""}
                    onChange={(e) => setEx(bi, ei, "note", e.target.value || null)}
                  />
                  <span className={ex.id ? "b-linked" : "b-unlinked"}>
                    {ex.id ? "● linked" : "○ custom"}
                  </span>
                </div>
              </div>
            ))}

            <button className="b-add" onClick={() => setPickerFor(bi)}>
              + Add exercise from database
            </button>
          </div>
        ))}

        <button className="b-add" onClick={addBlock}>+ Add block</button>
      </div>

      <div className="builder-foot">
        <button className="btn small" onClick={copyJson}>{copied ? "Copied!" : "Copy JSON"}</button>
        <button className="btn primary" onClick={() => onSave(draft)}>Save workout</button>
      </div>

      {pickerFor !== null && (
        <ExercisePicker onPick={addExercise} onClose={() => setPickerFor(null)} />
      )}
    </div>
  );
}
