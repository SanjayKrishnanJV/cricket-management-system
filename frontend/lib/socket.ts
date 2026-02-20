import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      this.socket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  // Match events
  joinMatch(matchId: string) {
    this.getSocket().emit('join-match', matchId);
  }

  leaveMatch(matchId: string) {
    this.getSocket().emit('leave-match', matchId);
  }

  onScoreUpdate(callback: (data: any) => void) {
    this.getSocket().on('score-update', callback);
  }

  offScoreUpdate() {
    this.getSocket().off('score-update');
  }

  recordBall(data: any) {
    this.getSocket().emit('record-ball', data);
  }

  getLiveScore(matchId: string) {
    this.getSocket().emit('get-live-score', matchId);
  }

  onLiveScore(callback: (data: any) => void) {
    this.getSocket().on('live-score', callback);
  }

  // Auction events
  joinAuction(auctionId: string) {
    this.getSocket().emit('join-auction', auctionId);
  }

  leaveAuction(auctionId: string) {
    this.getSocket().emit('leave-auction', auctionId);
  }

  placeBid(data: any) {
    this.getSocket().emit('place-bid', data);
  }

  onNewBid(callback: (data: any) => void) {
    this.getSocket().on('new-bid', callback);
  }

  offNewBid() {
    this.getSocket().off('new-bid');
  }

  onPlayerSold(callback: (data: any) => void) {
    this.getSocket().on('player-sold', callback);
  }

  offPlayerSold() {
    this.getSocket().off('player-sold');
  }

  onBidError(callback: (data: any) => void) {
    this.getSocket().on('bid-error', callback);
  }

  // Poll events
  createPoll(matchId: string, data: any) {
    this.getSocket().emit('create-poll', { matchId, ...data });
  }

  votePoll(matchId: string, pollId: string, userId: string, answer: string) {
    this.getSocket().emit('vote-poll', { matchId, pollId, userId, answer });
  }

  closePoll(matchId: string, pollId: string) {
    this.getSocket().emit('close-poll', { matchId, pollId });
  }

  onNewPoll(callback: (data: any) => void) {
    this.getSocket().on('new-poll', callback);
  }

  offNewPoll() {
    this.getSocket().off('new-poll');
  }

  onPollUpdate(callback: (data: any) => void) {
    this.getSocket().on('poll-update', callback);
  }

  offPollUpdate() {
    this.getSocket().off('poll-update');
  }

  onPollClosed(callback: (data: any) => void) {
    this.getSocket().on('poll-closed', callback);
  }

  offPollClosed() {
    this.getSocket().off('poll-closed');
  }

  onPollError(callback: (data: any) => void) {
    this.getSocket().on('poll-error', callback);
  }

  offPollError() {
    this.getSocket().off('poll-error');
  }

}

export const socketService = new SocketService();
