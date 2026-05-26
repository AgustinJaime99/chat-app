# Componentes Reutilizables

## 📁 Estructura de Componentes

```
components/
├── auth/
│   └── auth-form.tsx          # Formulario de login/register
├── chat/
│   ├── chat-sidebar.tsx       # Sidebar con rooms y controles
│   ├── chat-header.tsx        # Header con info del room
│   ├── chat-input.tsx         # Input de mensajes
│   └── empty-state.tsx        # Estado vacío (sin room)
├── invite/
│   ├── invite-card.tsx        # Card de invitación
│   └── invite-error.tsx       # Error de invitación
├── ui/
│   └── loading-screen.tsx     # Pantalla de loading
├── dialog.tsx                 # Sistema de diálogos/modales
├── toast.tsx                  # Sistema de notificaciones
├── create-room-dialog.tsx     # Diálogo para crear room
├── room-list.tsx              # Lista de rooms
└── message-list.tsx           # Lista de mensajes
```

## 🎯 Componentes por Categoría

### Autenticación

#### `<AuthForm />`
**Ubicación**: `components/auth/auth-form.tsx`

Formulario reutilizable para login y registro.

**Props**:
```tsx
interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: AuthFormData) => Promise<void>;
  onToggleMode: () => void;
}
```

**Uso**:
```tsx
<AuthForm 
  mode="login" 
  onSubmit={handleSubmit} 
  onToggleMode={toggleMode} 
/>
```

**Características**:
- ✅ Validación de formulario
- ✅ Estados de loading
- ✅ Manejo de errores
- ✅ Toggle entre login/register

---

### Chat

#### `<ChatSidebar />`
**Ubicación**: `components/chat/chat-sidebar.tsx`

Sidebar completo con lista de rooms, tabs, y controles.

**Props**:
```tsx
interface ChatSidebarProps {
  user: { username: string };
  rooms: Room[];
  publicRooms: Room[];
  activeRoomId?: string | null;
  view: 'my-rooms' | 'join-room';
  connected: boolean;
  onViewChange: (view: 'my-rooms' | 'join-room') => void;
  onCreateRoom: () => void;
  onSelectRoom: (room: Room) => void;
  onLeaveRoom: (roomId: string) => void;
  onJoinRoom: (roomId: string) => void;
  onLogout: () => void;
}
```

**Características**:
- ✅ User header con logout
- ✅ Tabs (My Rooms / Join a Room)
- ✅ Lista de rooms con scroll
- ✅ Indicador de conexión WebSocket

---

#### `<ChatHeader />`
**Ubicación**: `components/chat/chat-header.tsx`

Header del chat con información del room activo.

**Props**:
```tsx
interface ChatHeaderProps {
  room: Room | null;
  onInvite?: () => void;
  onLeave?: () => void;
}
```

**Características**:
- ✅ Nombre del room
- ✅ Íconos de privacidad (Lock/Globe)
- ✅ Contador de miembros
- ✅ Botones de Invite y Leave

---

#### `<ChatInput />`
**Ubicación**: `components/chat/chat-input.tsx`

Input de mensajes con indicador de typing.

**Props**:
```tsx
interface ChatInputProps {
  disabled?: boolean;
  placeholder?: string;
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}
```

**Características**:
- ✅ Auto-limpia después de enviar
- ✅ Notifica typing al escribir
- ✅ Validación de contenido vacío
- ✅ Estados disabled

---

#### `<EmptyState />`
**Ubicación**: `components/chat/empty-state.tsx`

Estado vacío cuando no hay room seleccionado.

**Props**:
```tsx
interface EmptyStateProps {
  hasRooms: boolean;
  onCreateRoom: () => void;
  onBrowseRooms: () => void;
}
```

**Características**:
- ✅ Mensaje contextual según si tiene rooms
- ✅ Botones de acción (Create/Browse)
- ✅ Ícono grande centrado

---

### Invitaciones

#### `<InviteCard />`
**Ubicación**: `components/invite/invite-card.tsx`

Card de invitación con información del room.

**Props**:
```tsx
interface InviteCardProps {
  room: Room;
  accepting: boolean;
  onAccept: () => void;
  onCancel: () => void;
}
```

**Características**:
- ✅ Ícono de privacidad
- ✅ Nombre del room
- ✅ Contador de miembros
- ✅ Estados de loading

---

#### `<InviteError />`
**Ubicación**: `components/invite/invite-error.tsx`

Estado de error para invitaciones inválidas.

**Props**:
```tsx
interface InviteErrorProps {
  message: string;
  onGoToChat: () => void;
}
```

---

### UI General

#### `<LoadingScreen />`
**Ubicación**: `components/ui/loading-screen.tsx`

Pantalla de loading reutilizable.

**Props**:
```tsx
interface LoadingScreenProps {
  message?: string; // Default: "Loading..."
}
```

**Uso**:
```tsx
<LoadingScreen message="Loading invite..." />
```

---

#### `<Dialog />` y `<ConfirmDialog />`
**Ubicación**: `components/dialog.tsx`

Sistema de diálogos/modales.

**Dialog Props**:
```tsx
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}
```

**ConfirmDialog Props**:
```tsx
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}
```

**Uso**:
```tsx
<ConfirmDialog
  open={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleConfirm}
  title="Leave Room"
  message="Are you sure?"
  variant="danger"
/>
```

---

#### `<Toast />` (Provider + Hook)
**Ubicación**: `components/toast.tsx`

Sistema de notificaciones toast.

**Setup**:
```tsx
// En layout.tsx
<ToastProvider>
  {children}
</ToastProvider>
```

**Uso**:
```tsx
const toast = useToast();

toast.success('Room created!');
toast.error('Failed to join');
toast.info('New message');
```

**Características**:
- ✅ 3 tipos: success, error, info
- ✅ Auto-dismiss (4s)
- ✅ Botón de cierre manual
- ✅ Animaciones suaves

---

#### `<CreateRoomDialog />`
**Ubicación**: `components/create-room-dialog.tsx`

Diálogo para crear un nuevo room.

**Props**:
```tsx
interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, isPrivate: boolean) => void;
}
```

**Características**:
- ✅ Input de nombre
- ✅ Selector visual de privacidad
- ✅ Validación
- ✅ Auto-limpia al cerrar

---

### Listas

#### `<RoomList />`
**Ubicación**: `components/room-list.tsx`

Lista de rooms con props condicionales.

**Props**:
```tsx
interface RoomListProps {
  rooms: Room[];
  activeRoomId?: string | null;
  onSelectRoom?: (room: Room) => void;
  onLeaveRoom?: (roomId: string) => void;
  onJoinRoom?: (roomId: string) => void;
  emptyMessage?: string;
}
```

**Uso (My Rooms)**:
```tsx
<RoomList
  rooms={myRooms}
  activeRoomId={activeRoom?.id}
  onSelectRoom={setActiveRoom}
  onLeaveRoom={handleLeave}
/>
```

**Uso (Public Rooms)**:
```tsx
<RoomList
  rooms={publicRooms}
  onJoinRoom={handleJoin}
/>
```

---

#### `<MessageList />`
**Ubicación**: `components/message-list.tsx`

Lista de mensajes con scroll automático.

**Props**:
```tsx
interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}
```

**Uso**:
```tsx
<MessageList 
  ref={scrollRef} 
  messages={messages} 
  currentUserId={user.id} 
/>
```

**Características**:
- ✅ forwardRef para scroll
- ✅ Diferenciación visual (propios/ajenos)
- ✅ Timestamps formateados
- ✅ Usernames en mensajes ajenos

---

## 📊 Beneficios de la Componentización

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Líneas en pages** | 372+ | ~150 |
| **Reutilización** | Baja | Alta |
| **Testing** | Difícil | Fácil |
| **Mantenibilidad** | Baja | Alta |
| **Legibilidad** | Media | Excelente |

## 🎨 Patrones Aplicados

### 1. **Composición**
Los componentes reciben callbacks como props en lugar de heredar lógica.

### 2. **Single Responsibility**
Cada componente tiene una responsabilidad única y bien definida.

### 3. **Props Condicionales**
`RoomList` adapta su comportamiento según las props que recibe.

### 4. **Controlled Components**
Los componentes no manejan estado interno, todo viene por props.

### 5. **Separation of Concerns**
- **Componentes**: Solo presentación
- **Pages**: Orquestación y lógica de negocio
- **Hooks**: Estado del servidor

## 🚀 Próximos Pasos (Opcionales)

1. **Storybook** para documentar componentes visualmente
2. **Unit tests** con React Testing Library
3. **Variantes** de componentes con CVA (class-variance-authority)
4. **Compound Components** para mayor flexibilidad
5. **Render Props** para casos avanzados

## 📝 Convenciones

- ✅ Todos los componentes son `'use client'`
- ✅ Props interfaces exportadas
- ✅ JSDoc en cada archivo
- ✅ Nombres descriptivos y consistentes
- ✅ Props opcionales con `?`
- ✅ Valores por defecto cuando aplica
