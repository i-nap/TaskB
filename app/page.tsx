'use client';

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Card {
  title: string;
  id: string;
  column: string;
}

interface CardProps {
  title: string;
  id: string;
  column: string;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
  isDragging: boolean;
}

interface AddCardProps {
  column: string;
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
}

interface ColumnProps {
  title: string;
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  column: string;
  draggedCardId: string | null;
  setDraggedCardId: (id: string | null) => void;
  deleteColumn: (column: string) => void;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {

      const savedCards = localStorage.getItem("cards");
      const savedColumns = localStorage.getItem("columns");
      const initialColumns = savedColumns ? JSON.parse(savedColumns) : ["Todo", "In Progress", "Done"];
      const initialCards = savedCards ? JSON.parse(savedCards) : RANDOM_CARDS;
      
      const validCards = initialCards.filter((card: Card) => initialColumns.includes(card.column));
      
      setCards(validCards);
      setColumns(initialColumns);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cards", JSON.stringify(cards));
      localStorage.setItem("columns", JSON.stringify(columns));
    }
  }, [cards, columns, isInitialized]);

  const addColumn = () => {
    const newColumnName = prompt("Enter the name of the new column:");
    if (newColumnName && !columns.includes(newColumnName)) {
      setColumns((prev) => [...prev, newColumnName]);
    }
  };

  const deleteColumn = (columnToDelete: string) => {
    if (confirm(`Are you sure you want to delete the "${columnToDelete}" column?`)) {
      setColumns((prev) => prev.filter((col) => col !== columnToDelete));
      setCards((prev) => prev.filter((card) => card.column !== columnToDelete));
    }
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full w-full gap-4 p-4">
      <div className="flex gap-2">
        <Button className="bg-primary text-white" onClick={addColumn}>
          Add Column
        </Button>
      </div>
      <div className="flex h-full w-full gap-10 overflow-scroll p-4">
        {columns.map((column) => (
          <Column
            key={column}
            title={column}
            cards={cards.filter(card => card.column === column)}
            setCards={setCards}
            column={column}
            draggedCardId={draggedCardId}
            setDraggedCardId={setDraggedCardId}
            deleteColumn={deleteColumn}
          />
        ))}
      </div>
    </div>
  );
}

const Column = ({
  title,
  cards,
  setCards,
  column,
  draggedCardId,
  setDraggedCardId,
  deleteColumn,
}: ColumnProps) => {
  const [active, setActive] = useState(false);
  const [isDropped, setIsDropped] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card) => {
    e.dataTransfer.setData("cardId", card.id);
    setDraggedCardId(card.id);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");
    if (!cardId) return;
    
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, column } : card
      )
    );
    setIsDropped(true);
    setTimeout(() => setIsDropped(false), 300);
    setDraggedCardId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className="w-60 shrink-0"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-200">{title}</h3>
        <Button
          onClick={() => deleteColumn(column)}
          className="text-sm text-red-500 hover:underline"
        >
          Delete
        </Button>
      </div>

      <div
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        } ${isDropped ? "animate-drop-highlight" : ""} flex flex-col gap-3`}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            {...card}
            handleDragStart={handleDragStart}
            isDragging={draggedCardId === card.id}
          />
        ))}
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
}

const Card = ({ title, id, column, handleDragStart, isDragging }: CardProps) => (
  <div
    draggable
    tabIndex={0}
    className={`cursor-grab rounded bg-neutral-600 p-5 ${
      isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"
    } transition-all duration-200 active:cursor-grabbing`}
    onDragStart={(e) => handleDragStart(e, { title, id, column })}
  >
    <p className="text-lg text-white">{title}</p>
  </div>
);

const AddCard = ({ column, setCards }: AddCardProps) => {
  const [title, setTitle] = useState("");
  const [active, setActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setCards((prev) => [
      ...prev,
      {
        title,
        id: Math.random().toString(36).substring(7),
        column,
      },
    ]);
    setActive(false);
    setTitle("");
  };

  return (
    <>
      {active ? (
        <form onSubmit={handleSubmit}>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="Add new tasks"
            className="w-full rounded border focus:outline-0"
          />
          <div className="mt-1 flex items-center justify-end gap-2">
            <Button
              type="submit"
              className="bg-primary text-white"
            >
              Add
            </Button>
            <Button 
              type="button"
              onClick={() => setActive(false)} 
              className="text-white"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          onClick={() => setActive(true)}
          className="flex w-full items-center gap-1.5 px-3 text-lg text-white"
        >
          <span>Add Cards</span>
        </Button>
      )}
    </>
  );
};

const RANDOM_CARDS: Card[] = [
  { title: "Create Next App", id: "1", column: "Todo" },
  { title: "Animation", id: "2", column: "In Progress" },
  { title: "Fix Bug #123", id: "3", column: "Todo" },
  { title: "Write Documentation", id: "4", column: "Done" },
];