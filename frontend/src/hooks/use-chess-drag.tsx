import { useState, useCallback, useRef, useEffect } from 'react';
import { Piece } from '@/components/chess/Piece';
import { ChessPiece } from '@/utils/chess'
import { cn } from '@/lib/utils'

export interface DragState {
  isDragging: boolean
  draggedPiece: ChessPiece | null
  draggedFrom: string | null
  hoveredSquare: string | null
  dragPosition: { x: number; y: number }
}

export interface UseChessDragOptions {
  onMove?: (from: string, to: string) => void
  disabled?: boolean
  legalMoves?: string[]
  onDragStart?: (piece: ChessPiece, square: string) => void
}

export interface DragHandlers {
  onDragStart: (e: React.MouseEvent | React.TouchEvent, piece: ChessPiece, square: string) => void
  onSquareEnter: (square: string) => void
  onSquareLeave: () => void
}

export function useChessDrag({ 
  onMove, 
  disabled = false, 
  legalMoves = [],
  onDragStart: onDragStartCallback
}: UseChessDragOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedPiece: null,
    draggedFrom: null,
    hoveredSquare: null,
    dragPosition: { x: 0, y: 0 },
  });

  const dragRef = useRef<{ isDragging: boolean }>({ isDragging: false });

  // Ref to hold the latest props and state, to avoid stale closures in event handlers.
  const internalStateRef = useRef({ onMove, disabled, dragState, legalMoves, onDragStartCallback });
  useEffect(() => {
    internalStateRef.current = { onMove, disabled, dragState, legalMoves, onDragStartCallback };
  });

  // We define event handlers in a ref to keep their identities stable.
  const eventHandlersRef = useRef({
    handleMove: (_e: MouseEvent | TouchEvent) => {},
    handleEnd: (_e: MouseEvent | TouchEvent) => {},
  });

  // This effect updates the handler functions on every render,
  // ensuring they have the latest state and props.
  useEffect(() => {
    eventHandlersRef.current.handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current.isDragging) return;

      let clientX, clientY;
      if ('touches' in e) {
        if (e.touches.length === 0) return;
        const touch = e.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;

        const element = document.elementFromPoint(clientX, clientY);
        const square = element?.closest('[data-square]')?.getAttribute('data-square');
        setDragState(prev => ({ ...prev, hoveredSquare: square || null }));
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      setDragState(prev => ({
        ...prev,
        dragPosition: { x: clientX, y: clientY },
      }));
    };

    eventHandlersRef.current.handleEnd = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current.isDragging) return;

      dragRef.current.isDragging = false;

      // Cleanup listeners
      document.removeEventListener('mousemove', eventHandlersRef.current.handleMove as EventListener);
      document.removeEventListener('mouseup', eventHandlersRef.current.handleEnd as EventListener);
      document.removeEventListener('touchmove', eventHandlersRef.current.handleMove as EventListener);
      document.removeEventListener('touchend', eventHandlersRef.current.handleEnd as EventListener);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';

      let clientX, clientY;
      if ('changedTouches' in e) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const element = document.elementFromPoint(clientX, clientY);
      const square = element?.closest('[data-square]')?.getAttribute('data-square');

      const { onMove, disabled, dragState, legalMoves } = internalStateRef.current;
      if (square && dragState.draggedFrom && square !== dragState.draggedFrom && !disabled) {
        if (legalMoves.includes(square)) {
          onMove?.(dragState.draggedFrom, square);
        } else {
          // If the move is not legal, we don't call onMove, effectively reverting.
          // The piece will snap back to its original position because the FEN hasn't changed.
        }
      }

      setDragState({
        isDragging: false,
        draggedPiece: null,
        draggedFrom: null,
        hoveredSquare: null,
        dragPosition: { x: 0, y: 0 },
      });
    };
  });

  const onDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, piece: ChessPiece, square: string) => {
      if (internalStateRef.current.disabled) return;

      internalStateRef.current.onDragStartCallback?.(piece, square);

      e.preventDefault();
      e.stopPropagation();


      // Pre-emptively clean up any stray listeners
      document.removeEventListener('mousemove', eventHandlersRef.current.handleMove as EventListener);
      document.removeEventListener('mouseup', eventHandlersRef.current.handleEnd as EventListener);
      document.removeEventListener('touchmove', eventHandlersRef.current.handleMove as EventListener);
      document.removeEventListener('touchend', eventHandlersRef.current.handleEnd as EventListener);

      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      dragRef.current.isDragging = true;

      let clientX, clientY;
      if ('touches' in e) {
        if (e.touches.length === 0) return;
        const touch = e.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
        document.addEventListener('touchmove', eventHandlersRef.current.handleMove as EventListener, { passive: false });
        document.addEventListener('touchend', eventHandlersRef.current.handleEnd as EventListener);
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
        document.addEventListener('mousemove', eventHandlersRef.current.handleMove as EventListener);
        document.addEventListener('mouseup', eventHandlersRef.current.handleEnd as EventListener);
      }

      setDragState({
        isDragging: true,
        draggedPiece: piece,
        draggedFrom: square,
        hoveredSquare: null,
        dragPosition: { x: clientX, y: clientY },
      });
    },
    []
  );

  const onSquareEnter = useCallback(
    (square: string) => {
      if (!dragState.isDragging || disabled) return;
      setDragState(prev => ({ ...prev, hoveredSquare: square }));
    },
    [dragState.isDragging, disabled]
  );

  const onSquareLeave = useCallback(() => {
    if (!dragState.isDragging || disabled) return;
    setDragState(prev => ({ ...prev, hoveredSquare: null }));
  }, [dragState.isDragging, disabled]);

  // Cleanup effect for when the component unmounts
  useEffect(() => {
    return () => {
      if (dragRef.current.isDragging) {
        document.removeEventListener('mousemove', eventHandlersRef.current.handleMove as EventListener);
        document.removeEventListener('mouseup', eventHandlersRef.current.handleEnd as EventListener);
        document.removeEventListener('touchmove', eventHandlersRef.current.handleMove as EventListener);
        document.removeEventListener('touchend', eventHandlersRef.current.handleEnd as EventListener);
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
      }
    };
  }, []);

  const handlers: DragHandlers = {
    onDragStart,
    onSquareEnter,
    onSquareLeave,
  }

  return {
    dragState,
    handlers,
  }
}

// Drag preview component
export interface DragPreviewProps {
  dragState: DragState
  size?: 'sm' | 'md' | 'lg'
}

export function DragPreview({ dragState, size = 'md' }: DragPreviewProps) {
  if (!dragState.isDragging || !dragState.draggedPiece) {
    return null;
  }

  const sizeConfig = {
    sm: { size: 40, offset: 20 },
    md: { size: 60, offset: 30 },
    lg: { size: 80, offset: 40 },
  };

  const config = sizeConfig[size];

  return (
    <div
      className="fixed pointer-events-none z-50 select-none"
      style={{
        left: dragState.dragPosition.x - config.offset,
        top: dragState.dragPosition.y - config.offset,
        width: `${config.size}px`,
        height: `${config.size}px`,
      }}
    >
      <div
        className={cn(
          'flex items-center justify-center w-full h-full',
          'drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]'
        )}
      >
        <Piece piece={dragState.draggedPiece} />
      </div>
    </div>
  );
}