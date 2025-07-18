/**
 * @OnlyCurrentDoc
 */

function setupInitial() {
  setupSheet();
  setApiKey();
}

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let workbookSheet = ss.getSheetByName('워크북');
  if (!workbookSheet) {
    workbookSheet = ss.insertSheet('워크북');
    const headers = ['워크북ID', '교구', '워크북이름', '워크북설명', '워크북타입', '콘텐츠', '사용여부'];
    workbookSheet.appendRow(headers);
    
    // 스파이크 워크북 샘플 콘텐츠
    const spikeSampleContent = {
      type: "spike-essential", // 워크북 타입 명시
      tasks: ["스낵 가게 로봇 조립하기", "코딩 약속하기", "기본 코딩 완성하기"],
      thoughts: ["오늘 활동에서 가장 재미있었던 점은 무엇인가요?", "이 로봇으로 또 무엇을 할 수 있을까요?"]
    };

    // 브릭큐 하이브리드 워크북 샘플 콘텐츠
    const bricqHybridSampleContent = {
      type: "bricq-hybrid",
      mainQuestion: "크랭크는 회전 운동을 어떻게 직선 운동으로 바꿀까요?",
      keyConcepts: [
        { "term": "회전 운동", "description": "물체가 한 점을 중심으로 빙글빙글 도는 움직임이에요." },
        { "term": "직선 운동", "description": "물체가 곧은 길을 따라 나아가는 움직임이에요." }
      ],
      experiments: [
        "바퀴를 돌렸을 때 다리의 움직임을 관찰하고 기록해보세요.",
        "바퀴를 돌렸을 때 팔의 움직임을 관찰하고 기록해보세요."
      ],
      quizzes: [
        { "question": "자전거의 페달과 이 모델의 크랭크는 어떤 점이 비슷할까요?", "type": "textarea" },
        { "question": "이런 움직임은 우리 생활 속 어디에 또 쓰일 수 있을까요?", "type": "textarea" }
      ],
      spikeExtension: {
        "title": " 스파이크로 확장하기",
        "mission": "팔에 컬러센서를 달아, 바닥의 색을 감지하면 다른 소리가 나도록 코딩해봅시다!",
        "requiredParts": ["컬러센서", "허브"],
        "ideaPrompt": "색깔마다 다른 소리를 내게 만들 수도 있어요! 나만의 반응을 코딩해볼까요?"
      }
    };
    
    const sampleRows = [
      ['snack-shop', '스파이크 에센셜', ' 알록달록 스낵 가게', '나만의 규칙으로 움직이는 로봇 가게!', 'spike', JSON.stringify(spikeSampleContent), true],
      ['mr-one-wheeler', '브릭큐 모션 프라임', '⚙️ 미스터 원 휠러', '크랭크 구조의 비밀을 파헤쳐요!', 'bricq', JSON.stringify(bricqHybridSampleContent), true]
    ];

    sampleRows.forEach(row => workbookSheet.appendRow(row));
    workbookSheet.autoResizeColumns(1, headers.length);
    Browser.msgBox('성공', "'워크북' 시트가 생성되고 샘플 데이터가 추가되었습니다.", Browser.Buttons.OK);
  }

  let recordSheet = ss.getSheetByName('기록');
  if (!recordSheet) {
    recordSheet = ss.insertSheet('기록');
    const headers = ['기록시간', '학생이름', '워크북ID', '워크북이름', '교구', '활동내용(체크리스트)', 'AI생성내용', '생각나누기', '교사피드백'];
    recordSheet.appendRow(headers);
    recordSheet.autoResizeColumns(1, headers.length);
    Browser.msgBox('성공', "'기록' 시트가 새로운 구조로 생성되었습니다.", Browser.Buttons.OK);
  }
}

function setApiKey() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Gemini API 키 설정',
    'Google AI Studio에서 발급받은 Gemini API 키를 여기에 붙여넣으세요:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() == ui.Button.OK) {
    const apiKey = response.getResponseText();
    if (apiKey) {
      PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', apiKey);
      ui.alert('성공', 'API 키가 안전하게 저장되었습니다.', ui.ButtonSet.OK);
    } else {
       ui.alert('오류', 'API 키가 입력되지 않았습니다.', ui.ButtonSet.OK);
    }
  }
}
