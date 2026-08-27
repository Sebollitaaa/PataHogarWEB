export function notificationText(n) {
  const petName = n.payload?.petName || 'una mascota';
  switch (n.type) {
    case 'pet_favorited_adopted':
      return `${petName} fue marcada como adoptada.`;
    case 'post_deleted_by_admin':
      return n.payload?.reason === 'marked_outdated'
        ? `Un moderador marcó "${petName}" como información desactualizada.`
        : `Un moderador eliminó tu publicación de ${petName}.`;
    case 'new_message_on_your_pet':
      return `Te escribieron por ${petName}.`;
    case 'reply_to_inquiry':
      return `Te respondieron por ${petName}.`;
    default:
      return 'Tenés una notificación nueva.';
  }
}

export function notificationLink(n) {
  if (n.payload?.conversationId) return `/mensajes/${n.payload.conversationId}`;
  if (n.payload?.petId) return `/mascotas/${n.payload.petId}`;
  return '/notificaciones';
}
