// eslint-disable-next-line no-unused-vars
import { KeyvFile } from "keyv-file";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import { BingAIClient } from "../index.js";

class BingAIWorker {
    constructor(config) {
        const {
            BING_USER_COOKIE,
            BING_PROXY,
            CACHE_FILE_PATH,
            host = "",
            cookies = "",
            debug = false
        } = config;

        const cacheOptions = {
            store: new KeyvFile({ filename: CACHE_FILE_PATH })
        };

        this.bingAIClient = new BingAIClient({
            host,
            userToken: BING_USER_COOKIE,
            cookies,
            proxy: BING_PROXY,
            debug,
            cache: cacheOptions
        });

        this.defaultToneStyle = "balanced";
    }

    /**
     * Invia un messaggio al client Bing AI.
     * @param {string} message - Il messaggio da inviare.
     * @param {Object} options - Opzioni aggiuntive per l'invio del messaggio.
     * @param {string} [options.toneStyle] - Stile di conversazione desiderato. Valori possibili: 'balanced', 'creative', 'precise', 'fast'.
     * @param {function(string): void} [options.onProgress] - Funzione di callback per il progresso dell'invio del messaggio. Viene chiamata con il token di progresso come argomento.
     * @returns {Promise<Object>} - La risposta della conversazione.
     */
    async getResponse(message, options = {}) {
        const { toneStyle = this.defaultToneStyle, onProgress } = options;

        const response = await this.bingAIClient.sendMessage(message, {
            ...options,
            toneStyle,
            onProgress,
            jailbreakConversationId: true
        });

        console.log(JSON.stringify(response, null, 2));
        return response;
    }
}

export default BingAIWorker;
