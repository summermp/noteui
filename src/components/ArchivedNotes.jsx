import React from 'react';
import NoteItem from './NoteItem';

const ArchivedNotes = ({ notes, onUnarchiveNote, onDeleteNote, categories }) => {
  return (
    <div className="archived-notes">
      <h2>Archived Notes ({notes.length})</h2>
      {notes.length === 0 ? (
        <p className="no-notes">No archived notes found.</p>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              onArchiveNote={onUnarchiveNote}
              onDeleteNote={onDeleteNote}
              categories={categories}
              isArchived={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedNotes;