/**
 * @OnlyCurrentDoc
 */

// [신규] 웹 앱에 필요한 초기 데이터를 한 번에 묶어서 전달하는 함수입니다.
function getInitialData() {
  try {
    const workbooks = getWorkbooks();
    const apiKey = getGeminiApiKey();
    return {
      workbooks: workbooks,
      apiKey: apiKey
    };
  } catch (e) {
    // 오류 발생 시, 클라이언트에서 오류를 처리할 수 있도록 오류 객체를 반환합니다.
    return { error: e.message };
  }
}

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('스마트 워크북')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function getGeminiApiKey() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
}

function getWorkbooks() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('워크북');
  if (!sheet) throw new Error("'워크북' 시트를 찾을 수 없습니다.");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  
  const idIndex = headers.indexOf('워크북ID');
  const toolIndex = headers.indexOf('교구');
  const nameIndex = headers.indexOf('워크북이름');
  const descIndex = headers.indexOf('워크북설명');
  const typeIndex = headers.indexOf('워크북타입');
  const contentIndex = headers.indexOf('콘텐츠');
  const enabledIndex = headers.indexOf('사용여부');

  if ([idIndex, toolIndex, nameIndex, descIndex, typeIndex, contentIndex, enabledIndex].includes(-1)) {
      throw new Error("'워크북' 시트의 머리글(헤더)이 올바르지 않습니다.");
  }

  return data.map(row => ({
      id: row[idIndex],
      tool: row[toolIndex],
      name: row[nameIndex],
      description: row[descIndex],
      type: row[typeIndex],
      content: row[contentIndex],
      enabled: row[enabledIndex]
    })).filter(workbook => workbook.enabled === true);
}

function saveRecord(recordData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const recordSheet = ss.getSheetByName('기록');
    if (!recordSheet) throw new Error("'기록' 시트를 찾을 수 없습니다.");

    const workbookSheet = ss.getSheetByName('워크북');
    const workbookData = workbookSheet.getDataRange().getValues();
    const workbookHeaders = workbookData.shift();
    const idIndex = workbookHeaders.indexOf('워크북ID');
    const contentIndex = workbookHeaders.indexOf('콘텐츠');

    let workbookContentString = workbookData.find(row => row[idIndex] === recordData.workbookId)?.[contentIndex];
    if (!workbookContentString) throw new Error(`워크북 ID '${recordData.workbookId}'를 찾을 수 없습니다.`);
    
    const workbookContent = JSON.parse(workbookContentString);
    
    let formattedTasks = '';
    let formattedThoughts = '';
    let aiStory = recordData.aiStory || '';

    const originalTasks = workbookContent.tasks || [];
    const completedStatus = recordData.activityContent.tasks || [];
    formattedTasks = originalTasks.map((task, index) => {
        const isCompleted = completedStatus[index] === true;
        return `${isCompleted ? '⭕' : '❌'} ${task}`;
    }).join('\n');

    if (workbookContent.type === 'bricq-hybrid') {
        const quizQuestions = workbookContent.quizzes || [];
        const quizAnswers = recordData.activityContent.quizzes || [];
        const formattedQuizzes = quizQuestions.map((q, index) => {
            return `[질문] ${q.question}\n➡️ [답변] ${quizAnswers[index] || '(답변 없음)'}`;
        }).join('\n\n');
        
        formattedThoughts = formattedQuizzes;

        if (workbookContent.spikeExtension && recordData.activityContent.spikeIdea) {
            const spikeIdeaTitle = workbookContent.spikeExtension.ideaPrompt || '나만의 아이디어';
            const spikeIdeaAnswer = recordData.activityContent.spikeIdea;
            formattedThoughts += `\n\n[코딩 아이디어] ${spikeIdeaTitle}\n➡️ [답변] ${spikeIdeaAnswer}`;
        }
        
    } else {
        const originalThoughts = workbookContent.thoughts || [];
        const studentAnswers = recordData.activityContent.thoughts || [];
        formattedThoughts = originalThoughts.map((question, index) => {
            return `[질문] ${question}\n➡️ [답변] ${studentAnswers[index] || '(답변 없음)'}`;
        }).join('\n\n');
    }

    const newRow = [
      new Date(), recordData.studentName, recordData.workbookId, recordData.workbookName,
      recordData.tool, formattedTasks, aiStory, formattedThoughts, ''
    ];

    recordSheet.appendRow(newRow);
    
    const lastRow = recordSheet.getLastRow();
    const headers = recordSheet.getRange(1, 1, 1, recordSheet.getLastColumn()).getValues()[0];
    const taskCol = headers.indexOf('활동내용(체크리스트)') + 1;
    const thoughtCol = headers.indexOf('생각나누기') + 1;
    
    if (taskCol > 0) recordSheet.getRange(lastRow, taskCol).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    if (thoughtCol > 0) recordSheet.getRange(lastRow, thoughtCol).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    
    return "성공적으로 저장되었습니다.";
  } catch (e) {
    console.error("saveRecord 오류: " + e.message);
    return "저장에 실패했습니다: " + e.message;
  }
}
