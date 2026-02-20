"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFUtils = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
class PDFUtils {
    static async generateScorecard(matchData) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const buffers = [];
                doc.on('data', (chunk) => buffers.push(chunk));
                doc.on('end', () => {
                    try {
                        const pdfData = Buffer.concat(buffers);
                        resolve(pdfData);
                    }
                    catch (error) {
                        console.error('Error concatenating PDF buffers:', error);
                        reject(error);
                    }
                });
                doc.on('error', (error) => {
                    console.error('PDFKit error:', error);
                    reject(error);
                });
                const primaryColor = '#1e3a8a';
                const secondaryColor = '#3b82f6';
                const lightGray = '#f3f4f6';
                doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);
                doc.fillColor('#ffffff')
                    .fontSize(24)
                    .font('Helvetica-Bold')
                    .text('CRICKET MATCH SCORECARD', 50, 30, { align: 'center' });
                doc.fontSize(12)
                    .font('Helvetica')
                    .text(`${matchData.homeTeam} vs ${matchData.awayTeam}`, 50, 65, { align: 'center' });
                doc.fillColor('#000000');
                doc.moveDown(3);
                const infoY = 120;
                doc.rect(50, infoY, doc.page.width - 100, 80).fill(lightGray);
                doc.fillColor('#000000')
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .text('Match Details', 60, infoY + 10);
                doc.font('Helvetica')
                    .text(`Venue: ${matchData.venue}`, 60, infoY + 30)
                    .text(`Date: ${new Date(matchData.matchDate).toLocaleString()}`, 60, infoY + 45)
                    .text(`Format: ${matchData.format}`, 60, infoY + 60);
                if (matchData.tossWinner) {
                    doc.text(`Toss: ${matchData.tossWinner} won and chose to ${matchData.tossDecision}`, doc.page.width / 2, infoY + 30);
                }
                doc.moveDown(5);
                if (matchData.resultText) {
                    const resultY = infoY + 100;
                    doc.rect(50, resultY, doc.page.width - 100, 50).fill(secondaryColor);
                    doc.fillColor('#ffffff')
                        .fontSize(14)
                        .font('Helvetica-Bold')
                        .text(matchData.resultText, 60, resultY + 18, { width: doc.page.width - 120, align: 'center' });
                    doc.fillColor('#000000');
                    doc.moveDown(3);
                }
                let currentY = matchData.resultText ? 270 : 220;
                if (matchData.innings && matchData.innings.length > 0) {
                    matchData.innings.forEach((innings, index) => {
                        if (currentY > 700) {
                            doc.addPage();
                            currentY = 50;
                        }
                        doc.rect(50, currentY, doc.page.width - 100, 35).fill(primaryColor);
                        doc.fillColor('#ffffff')
                            .fontSize(14)
                            .font('Helvetica-Bold')
                            .text(`${innings.battingTeam} - INNINGS ${index + 1}`, 60, currentY + 10);
                        doc.fontSize(12)
                            .text(`${innings.totalRuns}/${innings.totalWickets} (${innings.totalOvers} overs)`, doc.page.width - 200, currentY + 10);
                        currentY += 45;
                        doc.fillColor('#000000');
                        doc.rect(50, currentY, doc.page.width - 100, 25).fill(lightGray);
                        doc.fontSize(9)
                            .font('Helvetica-Bold')
                            .text('BATSMAN', 60, currentY + 8)
                            .text('R', doc.page.width - 250, currentY + 8)
                            .text('B', doc.page.width - 220, currentY + 8)
                            .text('4s', doc.page.width - 190, currentY + 8)
                            .text('6s', doc.page.width - 160, currentY + 8)
                            .text('SR', doc.page.width - 130, currentY + 8);
                        currentY += 25;
                        if (innings.battingPerformances) {
                            innings.battingPerformances.forEach((bat, idx) => {
                                const bgColor = idx % 2 === 0 ? '#ffffff' : lightGray;
                                doc.rect(50, currentY, doc.page.width - 100, 20).fill(bgColor);
                                doc.fillColor('#000000')
                                    .fontSize(9)
                                    .font('Helvetica')
                                    .text(bat.playerName, 60, currentY + 6, { width: 200 })
                                    .text(bat.runs.toString(), doc.page.width - 250, currentY + 6)
                                    .text(bat.ballsFaced.toString(), doc.page.width - 220, currentY + 6)
                                    .text(bat.fours.toString(), doc.page.width - 190, currentY + 6)
                                    .text(bat.sixes.toString(), doc.page.width - 160, currentY + 6)
                                    .text(bat.strikeRate.toFixed(2), doc.page.width - 130, currentY + 6);
                                currentY += 20;
                            });
                        }
                        currentY += 10;
                        if (innings.extras) {
                            doc.fontSize(9)
                                .font('Helvetica-Bold')
                                .text(`Extras: ${innings.extras} (W: ${innings.wides || 0}, NB: ${innings.noBalls || 0}, B: ${innings.byes || 0}, LB: ${innings.legByes || 0})`, 60, currentY);
                            currentY += 20;
                        }
                        doc.rect(50, currentY, doc.page.width - 100, 25).fill(lightGray);
                        doc.fontSize(9)
                            .font('Helvetica-Bold')
                            .text('BOWLER', 60, currentY + 8)
                            .text('O', doc.page.width - 250, currentY + 8)
                            .text('M', doc.page.width - 220, currentY + 8)
                            .text('R', doc.page.width - 190, currentY + 8)
                            .text('W', doc.page.width - 160, currentY + 8)
                            .text('ECO', doc.page.width - 130, currentY + 8);
                        currentY += 25;
                        if (innings.bowlingPerformances) {
                            innings.bowlingPerformances.forEach((bowl, idx) => {
                                const bgColor = idx % 2 === 0 ? '#ffffff' : lightGray;
                                doc.rect(50, currentY, doc.page.width - 100, 20).fill(bgColor);
                                doc.fillColor('#000000')
                                    .fontSize(9)
                                    .font('Helvetica')
                                    .text(bowl.playerName, 60, currentY + 6, { width: 200 })
                                    .text(bowl.oversBowled.toString(), doc.page.width - 250, currentY + 6)
                                    .text(bowl.maidens.toString(), doc.page.width - 220, currentY + 6)
                                    .text(bowl.runsConceded.toString(), doc.page.width - 190, currentY + 6)
                                    .text(bowl.wickets.toString(), doc.page.width - 160, currentY + 6)
                                    .text(bowl.economyRate.toFixed(2), doc.page.width - 130, currentY + 6);
                                currentY += 20;
                            });
                        }
                        currentY += 30;
                    });
                }
                if (matchData.manOfMatch) {
                    if (currentY > 700) {
                        doc.addPage();
                        currentY = 50;
                    }
                    doc.rect(50, currentY, doc.page.width - 100, 40).fill('#f59e0b');
                    doc.fillColor('#000000')
                        .fontSize(12)
                        .font('Helvetica-Bold')
                        .text('🏆 MAN OF THE MATCH', 60, currentY + 8)
                        .fontSize(14)
                        .text(matchData.manOfMatch, 60, currentY + 24);
                }
                const footerY = doc.page.height - 50;
                doc.fontSize(8)
                    .fillColor('#6b7280')
                    .text('Generated by Cricket Management System', 50, footerY, { align: 'center' })
                    .text(`Generated on: ${new Date().toLocaleString()}`, 50, footerY + 12, { align: 'center' });
                doc.end();
            }
            catch (error) {
                console.error('Error during PDF content generation:', error);
                reject(error);
            }
        });
    }
    static async generateTournamentReport(tournamentData) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);
            const primaryColor = '#1e3a8a';
            const lightGray = '#f3f4f6';
            doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);
            doc.fillColor('#ffffff')
                .fontSize(24)
                .font('Helvetica-Bold')
                .text('TOURNAMENT REPORT', 50, 30, { align: 'center' });
            doc.fontSize(14)
                .text(tournamentData.name, 50, 65, { align: 'center' });
            doc.fillColor('#000000');
            let currentY = 120;
            doc.rect(50, currentY, doc.page.width - 100, 80).fill(lightGray);
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .text('Tournament Details', 60, currentY + 10);
            doc.font('Helvetica')
                .text(`Format: ${tournamentData.format}`, 60, currentY + 30)
                .text(`Type: ${tournamentData.type}`, 60, currentY + 45)
                .text(`Start Date: ${new Date(tournamentData.startDate).toLocaleDateString()}`, 60, currentY + 60);
            doc.text(`End Date: ${new Date(tournamentData.endDate).toLocaleDateString()}`, doc.page.width / 2, currentY + 60);
            currentY += 100;
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('POINTS TABLE', 50, currentY);
            currentY += 25;
            doc.rect(50, currentY, doc.page.width - 100, 25).fill(lightGray);
            doc.fontSize(9)
                .text('TEAM', 60, currentY + 8)
                .text('P', doc.page.width - 320, currentY + 8)
                .text('W', doc.page.width - 280, currentY + 8)
                .text('L', doc.page.width - 240, currentY + 8)
                .text('NRR', doc.page.width - 200, currentY + 8)
                .text('PTS', doc.page.width - 140, currentY + 8);
            currentY += 25;
            if (tournamentData.pointsTable) {
                tournamentData.pointsTable.forEach((team, idx) => {
                    const bgColor = idx % 2 === 0 ? '#ffffff' : lightGray;
                    doc.rect(50, currentY, doc.page.width - 100, 20).fill(bgColor);
                    doc.fillColor('#000000')
                        .fontSize(9)
                        .font('Helvetica')
                        .text(team.teamName, 60, currentY + 6)
                        .text(team.played.toString(), doc.page.width - 320, currentY + 6)
                        .text(team.won.toString(), doc.page.width - 280, currentY + 6)
                        .text(team.lost.toString(), doc.page.width - 240, currentY + 6)
                        .text(team.netRunRate.toFixed(3), doc.page.width - 200, currentY + 6)
                        .text(team.points.toString(), doc.page.width - 140, currentY + 6);
                    currentY += 20;
                });
            }
            currentY += 30;
            if (tournamentData.topBatsmen || tournamentData.topBowlers) {
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .text('TOP PERFORMERS', 50, currentY);
                currentY += 25;
                if (tournamentData.topBatsmen) {
                    doc.fontSize(12)
                        .font('Helvetica-Bold')
                        .text('Leading Run Scorers', 60, currentY);
                    currentY += 20;
                    tournamentData.topBatsmen.slice(0, 5).forEach((batsman) => {
                        doc.fontSize(10)
                            .font('Helvetica')
                            .text(`${batsman.playerName}: ${batsman.runs} runs`, 60, currentY);
                        currentY += 15;
                    });
                    currentY += 15;
                }
                if (tournamentData.topBowlers) {
                    doc.fontSize(12)
                        .font('Helvetica-Bold')
                        .text('Leading Wicket Takers', 60, currentY);
                    currentY += 20;
                    tournamentData.topBowlers.slice(0, 5).forEach((bowler) => {
                        doc.fontSize(10)
                            .font('Helvetica')
                            .text(`${bowler.playerName}: ${bowler.wickets} wickets`, 60, currentY);
                        currentY += 15;
                    });
                }
            }
            const footerY = doc.page.height - 50;
            doc.fontSize(8)
                .fillColor('#6b7280')
                .text('Generated by Cricket Management System', 50, footerY, { align: 'center' })
                .text(`Generated on: ${new Date().toLocaleString()}`, 50, footerY + 12, { align: 'center' });
            doc.end();
        });
    }
}
exports.PDFUtils = PDFUtils;
//# sourceMappingURL=pdf.utils.js.map