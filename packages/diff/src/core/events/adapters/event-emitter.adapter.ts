/**
 * Adaptador de emisor de eventos usando eventos internos.
 *
 * Implementa EventEmitterPort usando un sistema de eventos simple
 * basado en Map para almacenar listeners.
 *
 * @module core/events/adapters/event-emitter
 */

import type { EventEmitterPort, EventListener } from '../ports/event-emitter.port.js';

/**
 * Adaptador de emisor de eventos.
 *
 * Implementa EventEmitterPort usando un sistema de eventos interno
 * que almacena listeners por nombre de evento.
 *
 * @class EventEmitterAdapter
 */
export class EventEmitterAdapter implements EventEmitterPort {
	/**
	 * Mapa de eventos y sus listeners.
	 * Cada evento puede tener múltiples listeners.
	 */
	private readonly listeners: Map<string, EventListener[]> = new Map();

	/**
	 * Suscribe un listener a un evento específico.
	 *
	 * @param params - Parámetros para la suscripción
	 * @param params.event - Nombre del evento al cual suscribirse
	 * @param params.listener - Función callback que se ejecuta cuando el evento se emite
	 */
	public on(params: { event: string; listener: EventListener }): void {
		const { event, listener } = params;

		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}

		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.push(listener);
		}
	}

	/**
	 * Emite un evento a todos los listeners suscritos.
	 *
	 * @param params - Parámetros para emitir el evento
	 * @param params.event - Nombre del evento a emitir
	 * @param params.message - Mensaje del evento
	 * @param params.progress - Progreso opcional (0-100)
	 */
	public emit(params: { event: string; message: string; progress?: number }): void {
		const { event, message, progress } = params;
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			for (const listener of eventListeners) {
				listener(message, progress);
			}
		}
	}
}
