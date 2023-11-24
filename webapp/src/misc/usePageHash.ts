import { useCallback, useEffect, useState } from "react";

export const usePageHash = () => {
    // Usa il hook useState per creare uno stato e una funzione per impostare l'hash
    const [hash, setHash] = useState<string>(() => window.location.hash);

    // Definisci una funzione per gestire il cambio dell'hash nella finestra
    const hashChangeHandler = useCallback(() => {
        // Imposta lo stato con l'hash corrente
        setHash(window.location.hash);
    }, []);

    // Usa il hook useEffect per aggiungere e rimuovere il listener all'evento "hashchange"
    useEffect(() => {
        window.addEventListener("hashchange", hashChangeHandler);
        return () => {
            window.removeEventListener("hashchange", hashChangeHandler);
        };
    }, [hashChangeHandler]); // Passa la funzione come dipendenza per il tuo effetto

    // Definisci una funzione per aggiornare l'hash manualmente
    const updateHash = useCallback(
        (newHash: string) => {
            // Se il nuovo hash è diverso dallo stato corrente, cambia l'hash della finestra
            if (newHash !== hash) window.location.hash = newHash;
        },
        [hash] // Passa lo stato come dipendenza per la tua funzione
    );

    // Restituisci lo stato e la funzione dal tuo hook personalizzato
    return [hash, updateHash] as const;
};
