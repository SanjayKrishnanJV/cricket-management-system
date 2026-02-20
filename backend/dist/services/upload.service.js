"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = exports.UploadService = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const aws_1 = require("../config/aws");
const mime = __importStar(require("mime-types"));
class UploadService {
    async uploadFile(file, folder, filename) {
        if (!aws_1.s3) {
            return this.uploadToLocal(file, folder, filename);
        }
        try {
            return await this.uploadToS3(file, folder, filename);
        }
        catch (error) {
            console.error('S3 upload failed, falling back to local storage:', error);
            return this.uploadToLocal(file, folder, filename);
        }
    }
    async uploadToS3(file, folder, filename) {
        if (!aws_1.s3)
            throw new Error('S3 client not initialized');
        const key = `${folder}/${filename}`;
        const contentType = mime.lookup(filename) || 'application/octet-stream';
        await aws_1.s3.upload({
            Bucket: aws_1.S3_BUCKET,
            Key: key,
            Body: file,
            ContentType: contentType,
            ACL: 'public-read',
        }).promise();
        return (0, aws_1.getAssetUrl)(key);
    }
    async uploadToLocal(file, folder, filename) {
        const uploadsDir = path.join(__dirname, '../../uploads', folder);
        await fs.mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, file);
        return (0, aws_1.getAssetUrl)(`${folder}/${filename}`);
    }
    async uploadPlayerImage(file, playerId) {
        const filename = `${playerId}-${Date.now()}.jpg`;
        return this.uploadFile(file, 'players', filename);
    }
    async uploadTeamLogo(file, teamId) {
        const filename = `${teamId}-${Date.now()}.png`;
        return this.uploadFile(file, 'teams', filename);
    }
    async uploadScorecard(file, matchId) {
        const filename = `scorecard-${matchId}-${Date.now()}.pdf`;
        return this.uploadFile(file, 'scorecards', filename);
    }
    async deleteFile(fileUrl) {
        try {
            const urlParts = fileUrl.split('/uploads/');
            if (urlParts.length < 2) {
                console.error('Invalid file URL:', fileUrl);
                return false;
            }
            const key = urlParts[1];
            if (aws_1.s3) {
                await aws_1.s3.deleteObject({
                    Bucket: aws_1.S3_BUCKET,
                    Key: key,
                }).promise();
            }
            else {
                const filePath = path.join(__dirname, '../../uploads', key);
                await fs.unlink(filePath);
            }
            return true;
        }
        catch (error) {
            console.error('File deletion error:', error);
            return false;
        }
    }
    async fileExists(fileUrl) {
        try {
            const urlParts = fileUrl.split('/uploads/');
            if (urlParts.length < 2)
                return false;
            const key = urlParts[1];
            if (aws_1.s3) {
                await aws_1.s3.headObject({
                    Bucket: aws_1.S3_BUCKET,
                    Key: key,
                }).promise();
                return true;
            }
            else {
                const filePath = path.join(__dirname, '../../uploads', key);
                await fs.access(filePath);
                return true;
            }
        }
        catch (error) {
            return false;
        }
    }
}
exports.UploadService = UploadService;
exports.uploadService = new UploadService();
//# sourceMappingURL=upload.service.js.map