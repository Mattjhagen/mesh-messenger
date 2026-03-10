# Mesh Messenger - Project TODO

## Phase 1: Core Infrastructure
- [x] Set up encryption module (AES-256-GCM, ECDH key exchange)
- [x] Implement Bluetooth LE scanning and discovery
- [x] Create user identity system (public/private key generation)
- [x] Set up local message storage with encryption at rest
- [x] Implement secure key exchange protocol

## Phase 2: Messaging Core
- [x] Create message model and database schema
- [x] Implement message encryption/decryption pipeline
- [x] Build message sending logic with retry mechanism
- [x] Implement message receiving and parsing
- [x] Add delivery status tracking (pending, sent, delivered, failed)

## Phase 3: Mesh Networking
- [x] Implement mesh node discovery and advertisement
- [x] Create routing table for multi-hop message relay
- [x] Build message relay logic (forward to nearby nodes)
- [x] Implement TTL (time-to-live) for message hops
- [x] Add duplicate message detection

## Phase 4: UI - Screens
- [ ] Create onboarding screen with setup flow
- [x] Build conversations list screen
- [x] Implement chat screen with message display
- [x] Create new conversation / nearby users discovery screen
- [x] Build settings screen with device info
- [ ] Add user profile view

## Phase 5: UI - Interactions
- [x] Implement text input with keyboard handling
- [x] Add message sending with visual feedback
- [ ] Create pull-to-refresh for conversations
- [ ] Add haptic feedback for interactions
- [ ] Implement message swipe actions (delete, copy)
- [x] Add loading states and empty states

## Phase 6: Features & Polish
- [x] Add user display name customization
- [x] Implement message timestamps and formatting
- [x] Add online/offline status indicators
- [x] Create notification system for new messages
- [x] Add app icon and branding
- [x] Implement dark mode support
- [ ] Add accessibility features (VoiceOver, high contrast)

## Phase 7: Testing & Deployment
- [ ] Write unit tests for encryption module
- [ ] Test mesh routing with multiple devices
- [ ] Test message delivery in various scenarios
- [ ] Performance testing and optimization
- [x] Create checkpoint for first delivery
