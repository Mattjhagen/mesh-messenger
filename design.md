# Mesh Messenger - Mobile App Design

## Overview

Mesh Messenger is a peer-to-peer messaging application that enables secure communication without relying on mobile data or Wi-Fi. Messages are encrypted end-to-end and can hop between nearby devices to reach distant recipients, creating a decentralized mesh network.

## Design Principles

- **Offline-First**: All communication happens locally via Bluetooth; no internet required
- **Privacy-Centric**: End-to-end encryption on all messages; no central server sees content
- **One-Handed Usage**: All interactive elements positioned for thumb reach on mobile portrait (9:16)
- **iOS-First Aesthetic**: Follows Apple Human Interface Guidelines with clean typography and generous spacing

## Screen List

### 1. Onboarding Screen
**Purpose**: Welcome new users and explain the app concept.
**Content**:
- App logo and title
- Brief explanation: "Send messages to nearby users without Wi-Fi or mobile data"
- Three feature callouts with icons
- "Get Started" button

### 2. Home Screen (Conversations List)
**Purpose**: Display all active conversations and allow starting new ones.
**Content**:
- Top bar with app title and settings icon
- List of conversations (sorted by most recent)
- Each conversation card shows: user name, last message preview, timestamp, unread badge
- Floating action button (FAB) to start new conversation
- Empty state if no conversations

### 3. Chat Screen
**Purpose**: Display messages in a conversation and allow sending new messages.
**Content**:
- Header: recipient name, online status indicator (mesh signal strength)
- Message list (scrollable, newest at bottom)
- Each message shows: sender name/avatar, message text, timestamp, delivery status icon
- Input area: text field + send button
- Keyboard handling: input area rises above keyboard

### 4. New Conversation Screen
**Purpose**: Discover and select nearby users to message.
**Content**:
- Search/filter field for user name or ID
- List of nearby discovered users
- Each user card: avatar, name, signal strength indicator, "Start Chat" button
- Loading state while scanning for nearby devices
- Empty state if no users found

### 5. Settings Screen
**Purpose**: Configure app preferences and view device info.
**Content**:
- Display Name (editable)
- User ID / Public Key (copyable)
- Bluetooth status toggle
- Mesh network info: connected nodes count, signal strength
- About section with version
- Privacy/encryption info

### 6. User Profile Screen
**Purpose**: View details of a conversation partner.
**Content**:
- User avatar and name
- Public key (copyable)
- Signal strength / distance estimate
- Message history with this user
- Block/report options

## Primary Content & Functionality

### Conversations List
- **Data**: Array of conversation objects with: id, userId, userName, lastMessage, timestamp, unreadCount
- **Functionality**: Tap to open chat, swipe to delete, long-press to pin/archive
- **Empty State**: "No conversations yet. Tap + to start one."

### Chat View
- **Data**: Array of message objects with: id, senderId, senderName, text, timestamp, deliveryStatus, isEncrypted
- **Functionality**: 
  - Send message (triggers encryption, mesh routing, delivery attempt)
  - Auto-scroll to newest message
  - Tap to show message details (timestamp, delivery status)
  - Long-press to copy, delete, or report
- **Delivery Status Icons**: 
  - ⏱️ Pending (not yet sent to mesh)
  - ✓ Sent (relayed to mesh)
  - ✓✓ Delivered (reached recipient)
  - ✗ Failed (unable to reach)

### Nearby Users Discovery
- **Data**: Array of discovered user objects with: id, name, signalStrength, lastSeen
- **Functionality**:
  - Continuous Bluetooth scanning
  - Filter by name
  - Tap to start conversation
  - Shows signal strength (bars: 1-4)
- **Loading State**: Spinner with "Scanning for nearby users..."

### Encryption & Security
- **Algorithm**: AES-256-GCM for message encryption
- **Key Exchange**: ECDH (Elliptic Curve Diffie-Hellman) for session key establishment
- **Storage**: All messages encrypted at rest using device keychain
- **User ID**: Public key hash (first 8 chars) displayed as user identifier

## Key User Flows

### Flow 1: Start a New Conversation
1. User taps FAB on home screen
2. App scans for nearby Bluetooth devices
3. Nearby users appear in list with signal strength
4. User taps a name to start conversation
5. App initiates key exchange with recipient
6. Chat screen opens with empty message history
7. User types and sends first message

### Flow 2: Send a Message
1. User types message in text input
2. User taps send button
3. App encrypts message with recipient's public key
4. Message marked as "Pending" in UI
5. App attempts to send via direct Bluetooth connection
6. If direct connection fails, app relays via nearby mesh nodes
7. When recipient receives, message marked as "Delivered"
8. If no route found after timeout, marked as "Failed"

### Flow 3: Receive a Message
1. App receives encrypted message from Bluetooth
2. App decrypts using private key
3. Message appears in chat (marked as "Delivered")
4. Notification badge appears on conversation
5. If app is backgrounded, local notification sent

### Flow 4: View Nearby Users
1. User navigates to "New Chat" screen
2. App starts Bluetooth scanning
3. Discovered devices appear in list (updated in real-time)
4. User can filter by name or ID
5. User taps to start conversation

## Color Palette

| Color | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Primary | #0a7ea4 | #0a7ea4 | Buttons, highlights, active states |
| Background | #ffffff | #151718 | Screen background |
| Surface | #f5f5f5 | #1e2022 | Cards, input fields |
| Foreground | #11181C | #ECEDEE | Primary text |
| Muted | #687076 | #9BA1A6 | Secondary text, hints |
| Border | #E5E7EB | #334155 | Dividers, borders |
| Success | #22C55E | #4ADE80 | Delivery success, online status |
| Warning | #F59E0B | #FBBF24 | Pending state, weak signal |
| Error | #EF4444 | #F87171 | Failed delivery, errors |

## Typography

- **Heading 1** (App Title): 28px, bold, primary color
- **Heading 2** (Screen Titles): 20px, semibold, foreground
- **Body** (Message Text, Labels): 16px, regular, foreground
- **Caption** (Timestamps, Hints): 12px, regular, muted
- **Button Text**: 16px, semibold, white (on primary background)

## Spacing & Layout

- **Padding**: 16px standard, 8px compact, 24px generous
- **Gap Between Elements**: 8px (compact), 12px (standard), 16px (generous)
- **Message Bubble Max Width**: 85% of screen width
- **Input Area Height**: 56px (text field) + 8px padding
- **Tab Bar Height**: 56px + safe area bottom

## Interaction Feedback

| Element | Feedback |
|---------|----------|
| Button Press | Scale 0.97 + haptic light |
| Message Send | Haptic success + animation |
| Conversation Swipe | Opacity 0.7 |
| Error State | Haptic error + red highlight |
| Delivery Success | Haptic notification + checkmark animation |

## Accessibility

- All interactive elements ≥44px tap target
- Color not sole indicator (use icons + text)
- High contrast text (WCAG AA minimum)
- Clear focus states for keyboard navigation
- VoiceOver support for screen readers
