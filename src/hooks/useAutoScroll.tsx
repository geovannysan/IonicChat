import { useRef, useLayoutEffect, useState, useCallback } from 'react';

/**
 * Un hook personalizado que gestiona el auto-scroll de un contenedor de chat.
 * Desplaza automáticamente el contenido hacia abajo solo si el usuario ya se encontraba al final.
 *
 * @param dep - Un array de dependencias que indica que el contenido ha cambiado (ej. [messages]).
 * @param externalRef - Una ref externa opcional para usar en lugar de crear una nueva.
 * @returns - Un objeto que contiene:
 *   - `containerRef`: La ref que debe ser adjuntada al elemento scrollable.
 *   - `isAtBottom`: Un booleano que es `true` si el scroll está al final.
 *   - `scrollToBottom`: Una función para desplazar manualmente el scroll al final.
 */
export function useAutoScroll(dep: any[] = [], externalRef?: React.RefObject<HTMLDivElement>) {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = externalRef || internalRef;
    const [isAtBottom, setIsAtBottom] = useState(true);

    const handleScroll = useCallback(() => {
        const node = containerRef.current;
        if (node) {
            // Se considera que está "al final" si está a 5px del final, para dar un margen.
            const atBottom = Math.abs(node.scrollHeight - node.scrollTop - node.clientHeight) < 5;
            console.log()
            setIsAtBottom(atBottom);
        }
    }, [containerRef]);

    // Efecto para añadir/quitar el listener de scroll
    useLayoutEffect(() => {
        const node = containerRef.current;
        if (!node) return;
        
        node.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Comprobación inicial

        return () => node.removeEventListener('scroll', handleScroll);
    }, [handleScroll, containerRef]);

    // Efecto que se ejecuta cuando el contenido (la dependencia) cambia
    useLayoutEffect(() => {
        const node = containerRef.current;
        const shouldScroll = isAtBottom;

        if (node && shouldScroll) {
            node.scrollTop = node.scrollHeight;
        }
    }, [dep, isAtBottom, containerRef]);

    const scrollToBottom = useCallback(() => {
        const node = containerRef.current;
        if (node) {
            node.scrollTo({
                top: node.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [containerRef]);

    return { containerRef, isAtBottom, scrollToBottom,handleScroll };
}