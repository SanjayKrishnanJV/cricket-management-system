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
exports.MAX_FILE_SIZE = exports.S3_BUCKET = exports.getAssetUrl = exports.s3 = void 0;
const AWS = __importStar(require("aws-sdk"));
const s3Enabled = process.env.AWS_S3_ENABLED === 'true';
exports.s3 = s3Enabled ? new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
}) : null;
const getAssetUrl = (path) => {
    if (!s3Enabled || !process.env.AWS_CLOUDFRONT_URL) {
        return `/uploads/${path}`;
    }
    return `${process.env.AWS_CLOUDFRONT_URL}/${path}`;
};
exports.getAssetUrl = getAssetUrl;
exports.S3_BUCKET = process.env.AWS_S3_BUCKET || '';
exports.MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880');
if (s3Enabled) {
    console.log('✅ AWS S3 enabled for file uploads');
    console.log(`   Bucket: ${exports.S3_BUCKET}`);
    console.log(`   Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`   CloudFront: ${process.env.AWS_CLOUDFRONT_URL || 'Not configured'}`);
}
else {
    console.log('ℹ️  AWS S3 disabled - using local file storage');
}
//# sourceMappingURL=aws.js.map