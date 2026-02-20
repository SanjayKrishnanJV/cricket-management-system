export declare class CacheService {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    deletePattern(pattern: string): Promise<number>;
    flushAll(): Promise<boolean>;
    invalidateMatch(matchId: string): Promise<void>;
    invalidatePlayer(playerId: string): Promise<void>;
    invalidateTournament(tournamentId: string): Promise<void>;
    invalidateTeam(teamId: string): Promise<void>;
    getStats(): Promise<any>;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=cache.service.d.ts.map