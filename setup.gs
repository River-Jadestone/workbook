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
    
    // [수정됨] 스파이크 에센셜 워크북 샘플 콘텐츠
    const spikeEssentialContent = {
      type: "spike-essential",
      learningGoals: [
        "모터 블록을 사용하여 로봇을 앞뒤로 움직일 수 있다.",
        "컬러 센서가 색깔을 인식하는 원리를 이해할 수 있다.",
        "특정 색깔을 감지했을 때, 로봇이 멈추도록 코딩할 수 있다."
      ],
      tasks: [
        "1. '스낵 가게' 모델의 몸체를 조립해요.",
        "2. 모터와 컬러 센서를 연결해요.",
        "3. 바퀴를 달아 조립을 완성해요."
      ],
      codingChallenges: [
        { level: 1, mission: "로봇을 2초 동안 앞으로 움직였다가 멈추게 코딩해봅시다." },
        { level: 2, mission: "파란색을 보면 멈추도록 코딩을 추가해봅시다. (힌트: '...까지 기다리기' 블록을 사용해보세요!)" },
        { level: 3, mission: "초록색을 보면 멈추고, '맛있게 드세요!' 소리를 내게 해봅시다." }
      ],
      thoughts: [
        "컬러 센서가 없었다면, 이 로봇은 어떻게 손님을 알아볼 수 있었을까요?",
        "만약 스낵 가게가 아니라 장난감 가게라면, 이 로봇을 어떻게 바꾸고 싶나요?",
        "오늘 코딩에서 가장 어려웠던 부분과, 그것을 어떻게 해결했는지 이야기해봅시다."
      ],
      aiKeywords: ["가게", "손님", "배달"]
    };

    // [신규] 스파이크 프라임 워크북 샘플 콘텐츠
    const spikePrimeContent = {
      type: "spike-prime",
      learningGoals: [
        "로봇팔의 구조와 그리퍼(집게)의 원리를 이해한다.",
        "거리 센서를 이용해 물체와의 거리를 측정할 수 있다.",
        "조건문('만약 ...이라면')을 사용하여 특정 상황에 따라 다르게 행동하는 로봇을 만들 수 있다."
      ],
      tasks: [
        "1. 로봇의 움직이는 본체(Chassis)를 만들어요.",
        "2. 물건을 집을 수 있는 로봇팔(Gripper)을 조립해서 붙여요.",
        "3. 앞쪽에 거리 센서를, 로봇팔에 컬러 센서를 연결해요."
      ],
      codingChallenges: [
        { level: 1, mission: "로봇을 움직여 책상 위의 장애물을 이리저리 피해 다니게 코딩해봅시다." },
        { level: 2, mission: "로봇 앞에 10cm 이내로 물체가 감지되면, 로봇팔을 내려 물건을 집는 동작을 하게 해봅시다." },
        { level: 3, mission: "파란색 물건을 집었을 때는 '파란색 상자로 이동!', 빨간색 물건을 집었을 때는 '빨간색 상자로 이동!'이라고 말하게 해봅시다." },
        { level: "최종 미션", mission: "책상 위에 흩어진 파란색, 빨간색 물건을 각각 지정된 장소로 옮겨서 정리하는 '슈퍼 청소 로봇'을 완성해보세요!" }
      ],
      thoughts: [
        "만약 거리 센서의 측정값이 자꾸 틀린다면, 어떤 점을 확인해봐야 할까요?",
        "이 청소 로봇을 우리 집에서 사용하려면 어떤 기능을 더 추가하면 좋을까요?",
        "여러 개의 모터를 동시에 제어할 때 어떤 점이 가장 중요했나요?"
      ],
      aiKeywords: ["청소", "로봇팔", "정리"]
    };
    
    const sampleRows = [
      ['snack-shop-v2', '스파이크 에센셜', '업그레이드! 스낵 가게', '손님이 원하는 색깔의 간식을 배달해줘요!', 'spike', JSON.stringify(spikeEssentialContent), true],
      ['super-cleaner', '스파이크 프라임', '슈퍼 청소 로봇', '장애물을 피하고, 색깔별로 물건을 정리해요!', 'spike', JSON.stringify(spikePrimeContent), true]
    ];

    sampleRows.forEach(row => workbookSheet.appendRow(row));
    workbookSheet.autoResizeColumns(1, headers.length);
    Browser.msgBox('성공', "'워크북' 시트가 새로운 샘플 데이터로 생성되었습니다.", Browser.Buttons.OK);
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