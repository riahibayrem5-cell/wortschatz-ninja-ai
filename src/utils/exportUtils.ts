import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// PDF Export for Vocabulary
export const exportVocabularyToPDF = async (items: any[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(147, 51, 234); // Primary purple
  doc.text('My Vocabulary List', 20, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 28);
  
  // Table data
  const tableData = items.map(item => [
    item.word,
    item.definition,
    item.example || '',
    item.topic || ''
  ]);
  
  autoTable(doc, {
    head: [['Word', 'Definition', 'Example', 'Topic']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [147, 51, 234], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  
  doc.save(`vocabulary_${Date.now()}.pdf`);
};

// PDF Export for Exercises
export const exportExercisesToPDF = async (exercises: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(147, 51, 234);
  doc.text('Exercise History', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 28);
  
  const tableData = exercises.map(ex => [
    ex.type,
    ex.topic || 'General',
    ex.is_correct ? 'Correct' : 'Incorrect',
    new Date(ex.completed_at).toLocaleDateString()
  ]);
  
  autoTable(doc, {
    head: [['Type', 'Topic', 'Result', 'Date']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [147, 51, 234], textColor: 255 },
  });
  
  doc.save(`exercises_${Date.now()}.pdf`);
};

// PDF Export for Writing Submissions
export const exportWritingToPDF = async (submissions: any[]) => {
  const doc = new jsPDF();
  
  submissions.forEach((sub, index) => {
    if (index > 0) doc.addPage();
    
    doc.setFontSize(18);
    doc.setTextColor(147, 51, 234);
    doc.text(`Writing Submission ${index + 1}`, 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date(sub.created_at).toLocaleDateString()}`, 20, 28);
    doc.text(`Score: ${sub.score || 'N/A'}/100`, 20, 34);
    
    // Prompt
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Prompt:', 20, 45);
    doc.setFontSize(10);
    const promptLines = doc.splitTextToSize(sub.prompt, 170);
    doc.text(promptLines, 20, 52);
    
    // Original Text
    let yPos = 52 + (promptLines.length * 5) + 10;
    doc.setFontSize(12);
    doc.text('Your Answer:', 20, yPos);
    doc.setFontSize(10);
    yPos += 7;
    const originalLines = doc.splitTextToSize(sub.original_text, 170);
    doc.text(originalLines, 20, yPos);
    
    // Corrected Text
    yPos += (originalLines.length * 5) + 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94); // Green
    doc.text('Corrected Version:', 20, yPos);
    doc.setFontSize(10);
    doc.setTextColor(0);
    yPos += 7;
    const correctedLines = doc.splitTextToSize(sub.corrected_text, 170);
    doc.text(correctedLines, 20, yPos);
    
    // Feedback
    yPos += (correctedLines.length * 5) + 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.text('Feedback:', 20, yPos);
    doc.setFontSize(10);
    yPos += 7;
    const feedbackLines = doc.splitTextToSize(sub.overall_feedback, 170);
    doc.text(feedbackLines, 20, yPos);
  });
  
  doc.save(`writing_submissions_${Date.now()}.pdf`);
};

// Export to Anki format (CSV)
export const exportToAnki = (items: any[], type: 'vocabulary' | 'memorizer') => {
  let csvContent = '';
  
  if (type === 'vocabulary') {
    csvContent = 'Front,Back,Example,Topic\n';
    items.forEach(item => {
      const front = `"${item.word.replace(/"/g, '""')}"`;
      const back = `"${item.definition.replace(/"/g, '""')}"`;
      const example = item.example ? `"${item.example.replace(/"/g, '""')}"` : '""';
      const topic = item.topic ? `"${item.topic.replace(/"/g, '""')}"` : '""';
      csvContent += `${front},${back},${example},${topic}\n`;
    });
  } else {
    csvContent = 'German,English,Theme,Difficulty\n';
    items.forEach(item => {
      const german = `"${item.german_text.replace(/"/g, '""')}"`;
      const english = `"${item.english_translation.replace(/"/g, '""')}"`;
      const theme = `"${item.theme.replace(/"/g, '""')}"`;
      const difficulty = `"${item.difficulty.replace(/"/g, '""')}"`;
      csvContent += `${german},${english},${theme},${difficulty}\n`;
    });
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${type}_anki_${Date.now()}.csv`;
  link.click();
};

// Export audio to WAV (for downloaded audio)
export const exportAudioToWAV = async (text: string, filename: string, lang: 'de-DE' | 'en-US' = 'de-DE') => {
  // This will download the audio file from the TTS service
  // In a real implementation, you'd convert the base64 audio to WAV format
  const link = document.createElement('a');
  link.download = `${filename}_${Date.now()}.mp3`;
  // Note: To convert to WAV, you'd need additional audio processing
  // For now, we'll download as MP3 which the TTS service provides
  link.click();
};

// Export Mistakes to PDF
export const exportMistakesToPDF = async (mistakes: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(239, 68, 68); // Red
  doc.text('Mistake Diary', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 28);
  
  mistakes.forEach((mistake, index) => {
    if (index > 0) doc.addPage();
    
    let yPos = 40;
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Mistake ${index + 1}`, 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Category: ${mistake.category} | Type: ${mistake.type}`, 20, yPos);
    doc.text(`Date: ${new Date(mistake.created_at).toLocaleDateString()}`, 20, yPos + 5);
    
    yPos += 15;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('Your Mistake:', 20, yPos);
    doc.setFontSize(10);
    yPos += 7;
    const contentLines = doc.splitTextToSize(mistake.content, 170);
    doc.text(contentLines, 20, yPos);
    
    yPos += (contentLines.length * 5) + 10;
    if (mistake.correction) {
      doc.setFontSize(11);
      doc.setTextColor(34, 197, 94);
      doc.text('Correction:', 20, yPos);
      doc.setFontSize(10);
      doc.setTextColor(0);
      yPos += 7;
      const correctionLines = doc.splitTextToSize(mistake.correction, 170);
      doc.text(correctionLines, 20, yPos);
      yPos += (correctionLines.length * 5) + 10;
    }
    
    if (mistake.explanation) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.setTextColor(59, 130, 246);
      doc.text('Explanation:', 20, yPos);
      doc.setFontSize(10);
      doc.setTextColor(0);
      yPos += 7;
      const explanationLines = doc.splitTextToSize(mistake.explanation, 170);
      doc.text(explanationLines, 20, yPos);
    }
  });
  
  doc.save(`mistakes_diary_${Date.now()}.pdf`);
};

// Export Conversations to PDF
export const exportConversationsToPDF = async (conversations: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(147, 51, 234);
  doc.text('Conversation History', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 28);
  
  conversations.forEach((conv, index) => {
    if (index > 0) doc.addPage();
    
    let yPos = 40;
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Conversation ${index + 1}`, 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Scenario: ${conv.scenario}`, 20, yPos);
    doc.text(`Date: ${new Date(conv.created_at).toLocaleDateString()}`, 20, yPos + 5);
    doc.text(`Status: ${conv.status}`, 20, yPos + 10);
    
    yPos += 20;
    
    if (conv.messages && conv.messages.length > 0) {
      conv.messages.forEach((msg: any) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(10);
        const textColor = msg.role === 'user' ? [59, 130, 246] : [34, 197, 94];
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(`${msg.role === 'user' ? 'You' : 'AI'}:`, 20, yPos);
        
        doc.setTextColor(0);
        const msgLines = doc.splitTextToSize(msg.content, 160);
        doc.text(msgLines, 30, yPos);
        
        yPos += (msgLines.length * 5) + 5;
      });
    }
  });
  
  doc.save(`conversations_${Date.now()}.pdf`);
};

// Export All Data
export const exportAllDataToPDF = async (data: {
  vocabulary: any[];
  exercises: any[];
  writing: any[];
  mistakes: any[];
  conversations: any[];
  progress: any;
}) => {
  const doc = new jsPDF();
  
  // Cover Page
  doc.setFontSize(24);
  doc.setTextColor(147, 51, 234);
  doc.text('WortschatzNinja', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
  doc.setFontSize(18);
  doc.text('Complete Learning Report', doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
  
  // Progress Summary
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text('Learning Progress Summary', 20, 20);
  
  if (data.progress) {
    const stats = [
      ['Words Learned', data.progress.words_learned?.toString() || '0'],
      ['Exercises Completed', data.progress.exercises_completed?.toString() || '0'],
      ['Current Streak', `${data.progress.streak_days || 0} days`],
      ['Last Activity', data.progress.last_activity_date || 'N/A']
    ];
    
    autoTable(doc, {
      body: stats,
      startY: 30,
      styles: { fontSize: 11 },
      theme: 'plain'
    });
  }
  
  // Add each section
  if (data.vocabulary.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Vocabulary', 20, 20);
    const vocabData = data.vocabulary.slice(0, 50).map(v => [v.word, v.definition]);
    autoTable(doc, {
      head: [['Word', 'Definition']],
      body: vocabData,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [147, 51, 234] }
    });
  }
  
  doc.save(`complete_report_${Date.now()}.pdf`);
};
