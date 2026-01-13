/**
 * Puerto para emisión de eventos.
 *
 * Define la interfaz abstracta para emisión y suscripción de eventos,
 * permitiendo desacoplar la lógica de negocio de la implementación concreta.
 *
 * @module core/events/ports/event-emitter
 */

/**
 * Tipo para listeners de eventos.
 *
 * @typedef EventListener
 * @type {(message: string, progress?: number) => void}
 */
export type EventListener = (message: string, progress?: number) => void;

/**
 * Puerto abstracto para emisión de eventos.
 *
 * Define la interfaz para suscribirse a eventos y recibir notificaciones
 * con mensajes y progreso opcional.
 *
 * @interface EventEmitterPort
 */
export interface EventEmitterPort {
	/**
	 * Suscribe un listener a un evento específico.
	 *
	 * @param params - Parámetros para la suscripción
	 * @param params.event - Nombre del evento al cual suscribirse
	 * @param params.listener - Función callback que se ejecuta cuando el evento se emite
	 */
	on(params: { event: string; listener: EventListener }): void;

	/**
	 * Emite un evento a todos los listeners suscritos.
	 *
	 * @param params - Parámetros para emitir el evento
	 * @param params.event - Nombre del evento a emitir
	 * @param params.message - Mensaje del evento
	 * @param params.progress - Progreso opcional (0-100)
	 */
	emit(params: { event: string; message: string; progress?: number }): void;
}
