export declare class UploadService {
    uploadFile(file: Buffer, folder: string, filename: string): Promise<string>;
    private uploadToS3;
    private uploadToLocal;
    uploadPlayerImage(file: Buffer, playerId: string): Promise<string>;
    uploadTeamLogo(file: Buffer, teamId: string): Promise<string>;
    uploadScorecard(file: Buffer, matchId: string): Promise<string>;
    deleteFile(fileUrl: string): Promise<boolean>;
    fileExists(fileUrl: string): Promise<boolean>;
}
export declare const uploadService: UploadService;
//# sourceMappingURL=upload.service.d.ts.map