"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

type SortableItem = {
  id: number;
};

type SortableListProps<TItem extends SortableItem> = {
  items: TItem[];
  dndId: string;
  onReorder: (orderedIds: number[]) => Promise<void>;
  renderHeader?: ReactNode;
  renderItem: (item: TItem, index: number) => ReactNode;
};

export function SortableList<TItem extends SortableItem>({
  items,
  dndId,
  onReorder,
  renderHeader,
  renderItem,
}: SortableListProps<TItem>) {
  const [optimisticItems, setOptimisticItems] = useOptimistic(items);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = optimisticItems.findIndex((item) => item.id === active.id);
    const newIndex = optimisticItems.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(optimisticItems, oldIndex, newIndex);

    startTransition(async () => {
      setOptimisticItems(reordered);
      await onReorder(reordered.map((item) => item.id));
    });
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={optimisticItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {renderHeader}
        <div className="divide-y divide-[var(--color-border)]">
          {optimisticItems.map((item, index) => renderItem(item, index))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
