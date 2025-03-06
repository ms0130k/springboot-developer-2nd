
/*********************************************************
 공통 변수 영역 [START]
 *********************************************************/
var DATE_SEPERATOR = "-"; // 날짜 구분선 2025-02-03
var TIME_SEPERATOR = ":"; // 시간 구분선 17:30:30
var DEFAULT_SEARCH_PERIOD = 3; // 날짜 from to 검색시 기본 조회 단위(월)
/*********************************************************
 공통 변수 영역 [END]
 *********************************************************/
function gfn_logout() {
  var sOriginUrl = document.location.origin;

  window.top.location.href = sOriginUrl + "/login/actionLogout.do"; // "./login/actionLogout.do";
}

/*********************************************************
 * NAME   : gfn_GetMessage()
 * DESC   : 메시지 프로퍼티스 정보를 조회
 * PARAM  : key		- 메시지(템플릿) 키
 *          args	- 메시지 템플릿에 삽입될 메시지
 * RETURN : 메시지, 자바의 메시지 properties 복제본
 *
 * 2025.1.9  김동현  최초 작성
 *********************************************************/
const gfn_GetMessage = (key, args = []) => {
  const isEn = true;
  const resource = isEn ? MESSAGE_EN : MESSAGE_KO;
  const template = resource[key];

  if (!template) throw Error('no message : ' + key);

  return args.reduce((result, arg, i) => {
    const pattern = new RegExp(`\\{${i}\\}`);
    return result.replace(pattern, arg);
  }, template);
};

/*********************************************************
 * NAME   : gfn_GetMessageUsingKeyArgs()
 * DESC   : 메시지 프로퍼티스 정보를 조회
 * PARAM  : key		- 메시지(템플릿) 키
 *          args	- 메시지 템플릿에 삽입될 메시지 키
 * RETURN : 메시지, 자바의 메시지 properties 복제본
 *
 * 2025.1.20  김동현  최초 작성
 *********************************************************/
const gfn_GetMessageUsingKeyArgs = (key, args = []) => {
  const isEn = true;
  const resource = isEn ? MESSAGE_EN : MESSAGE_KO;
  const template = resource[key];

  if (!template) throw Error('no message : ' + key);

  return args.reduce((result, arg, i) => {
    const converted = gfn_GetMessage(arg);
    const pattern = new RegExp(`\\{${i}\\}`);
    return result.replace(pattern, converted);
  }, template);
};
/*********************************************************
 * NAME   : gfn_SubmitForm()
 * DESC   : submit 수행, method 미작성시 기본 POST
 * PARAM  : action	: submit action url
 *          params	: submit 파라미터
 *          options	: method: submit method, 기본값 POST
 * RETURN : void
 *
 * 2025.1.20  김동현  최초 작성
 *********************************************************/
const gfn_SubmitForm = (action, params = {}, {method = 'POST'} = {}) => {
  const form = document.createElement('form');

  form.action = action;
  form.method = method;

  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};

/*********************************************************
 * NAME   : gfn_OpenWindow(theURL, winName, w, h, callbackObj, option, paramObj)
 * DESC   : 팝업 윈도우를 오픈한다.
 * PARAM  : theURL    - 팝업으로 오픈할 파일의 경로
 *          winName   - 팝업 윈도우 명
 *          w         - 팝업 width
 *          h         - 팝업 height
 *          option    - 팝업창 option 문자열, null 일 경우 기본세팅
 *          paramObj  - 1. json 형식의 오브젝트, 예; {param1:1, param2:"이름", param3:"부서"}
 * RETURN : 팝업 윈도우 Object
 * 호출예시 :   let theURL = '/Common/ApprovalRead/viewApprovalReadPopup';
 *            let winName = 'ApprovalReadPopup';
 *            let w = 800;
 *            let h = 600;
 *            let callbackObj = function (rtnPopupObj) {console.log("rtnObj : " + rtnPopupObj)};
 *            let option = "width=800,height=600,left=0,top=0,scrollbars=no,menubar=no,resizable=no";
 *            let paramObj = {
 *                            pjtCod : pjtCod,
 *                            menuCod : menuCod,
 *                            aprvListTyp : aprvListTyp,
 *                            dataIdx : dataIdx,
 *                            aprvIdx : aprvIdx
 *                            };
 *            호출유형1: gfn_OpenWindow(theURL, winName, w, h);
 *            호출유형2: gfn_OpenWindow(theURL, winName, w, h, callbackObj, option, paramObj);
 *            호출유형3: gfn_OpenWindow(theURL, winName, w, h, callbackObj, null, paramObj);
 *
 * 2024.12.24  장민훈  최초 작성
 *********************************************************/
var callbacks= new Map();
var rtnParams = new Map();
const gfn_OpenWindow = (theURL, winName, w, h, callbackObj, option, paramObj) => {
  console.assert(winName);

  let posX = ((screen.width / 2) - (w / 2));
  let posY = ((screen.height / 2) - (h / 2)) - 30;

  let strOption = "width=" + w + ",height=" + h + ",left=" + posX + ",top=" + posY;
  //scrollbars=no,menubar=no,resizable=no

  const fromName = "commonPopupForm";

  let $popupForm = $("<form/>").attr("id", fromName).attr("name", fromName).attr("method", "post");

  if (theURL.indexOf("?") != -1) {
    let arrParams = theURL.split("?");
    theURL = arrParams[0];
    arrParams = arrParams[1];

    if (arrParams.indexOf("&") != -1) {
      arrParams = arrParams.split("&");
    }

    const params = {};
    arrParams.forEach(function (strParamKeyValue) {
      let strParam = strParamKeyValue.split("=");
      let key = strParam[0];
      let value = strParam[1];

      let inpuHtmlTag = "<input type='hidden' name='" + key + "' value='" + value + "'>";
      $popupForm.append(inpuHtmlTag);

      params[key] = value;
    });
    rtnParams.set(winName, params);
  } else {
    if (typeof (paramObj) === 'object') {
      let paramKeys = Object.keys(paramObj);

      paramKeys.forEach(function (key) {
        let inpuHtmlTag = "<input type='hidden' name='" + key + "' value='" + paramObj[key] + "'>";
        $popupForm.append(inpuHtmlTag);
      });

      rtnParams.set(winName, paramObj);
    }
  }

  if (!gfn_isNull(option)) {
    strOption = option;
  }

  if (!gfn_isNull(callbackObj)) {
    callbacks.set(winName, callbackObj)
  }

  let rtnWinObj = window.open('', winName, strOption);

  $popupForm.attr("action", theURL);
  $popupForm.attr("target", winName);
  $popupForm.appendTo("body");
  $popupForm.submit();
  $popupForm.remove();

  return rtnWinObj;
};

/*********************************************************
 * NAME   : gfn_PopupCallback(rtnPopupObj)
 * DESC   : 팝업을 닫을때 호출되는 콜백 함수
 * PARAM  : rtnPopupObj    - 팝업에서 리턴받은 오브젝트
 * RETURN : rtnObj      : json Object
 *          calledParam : 팝업 호출했을때 전달받은 파라미터 오브젝트(json 형식의 key1)
 *          returnParam : 팝업에서 리턴된 오브젝트 (json 형식의 key2)
 *          예; rtnObj = {calledParam : {}, returnParam : {}}
 * 호출예시 : opener.gfn_PopupCallback({userName:"홍길동"});
 *
 * 2024.12.24  장민훈  최초 작성
 *********************************************************/
const gfn_PopupCallback = (rtnPopupObj) => {
  const opener = window.opener;
  const winName = window.name;

  if (!opener) {
    console.log('parent window is closed');
    window.close();
    return;
  }

  let rtnObj = {};
  rtnObj.calledParam = opener.rtnParams.get(winName);
  rtnObj.returnParam = rtnPopupObj;

  const callback = opener.callbacks.get(winName);
  if (typeof callback === 'function') {
    callback(rtnObj);
  } else if (callback === 'string') {
    eval(callback)(rtnObj);
  }

  opener.rtnParams.delete(winName);
  opener.callbacks.delete(winName);

  return;
};
/*********************************************************
 * NAME   : gfn_Alert(msg, type, callback)
 * DESC   : type에 따른 경고창을 생성하고 확인 버튼을 클릭시 callback 함수를 호출한다.
 * PARAM  : [필수] msg				: 경고창에 보여줄 메시지
 *          [선택] type / callback	: 경고 유형 / callback
 *          [선택] callback		: callback 함수
 * RETURN : boolean
 *
 * 2025.1.22  장민훈  최초 작성
 *********************************************************/
const gfn_Alert = (function () {
  const alertQueue = [];
  const TITLES = {
    N: '알림',
    W: '경고',
    E: '오류',
  };
  let alertIsOpen = false;
  const showAlert = (msg, type = 'N', callback) => {
    if (gfn_isNull(type)) {
      type = 'N';
    }

    if (typeof type === 'function') {
      callback = type;
      type = 'N';
    }
    type = type.toUpperCase();

    alertQueue.push({msg, type, callback});
    if (!alertIsOpen) {
      processAlert();
    }
  };
  const processAlert = () => {
    if (alertQueue.length === 0) {
      alertIsOpen = false;
      return;
    }

    alertIsOpen = true;
    const {msg, type, callback} = alertQueue.shift();

    setArea();
    $('#alertWindow').html(msg.replace(/\n/g, '<br>')).dialogAlert({
      title: TITLES[type],
      buttons: [{
        text: gfn_GetMessage('txtOK'),
        click() {
          $(this).dialogAlert('close');
        },
      }],
      close() {
        if (callback) callback();
        processAlert();
      },
    });
  };
  const setArea = () => {
    if (!$('#alertWindow')[0])
      $('body').append(`<div id="alertWindow" style="display: none"></div>`);
  };

  return showAlert;
})();


/*********************************************************
 * NAME   : gfn_Confirm(sMsg,callback)
 * DESC   : 확인창을 생성하고 확인/취소 버튼을 클릭시 callback 함수를 호출한다.
 * PARAM  : sMsg	  : 확인창에 보여줄 메시지
 *          callback  : callback 함수 (인자로 true/false 리턴)
 * RETURN : boolean
 *
 * 2025.1.22  장민훈  최초 작성
 *********************************************************/
var ___bConfirmDupChk= false;
const gfn_Confirm = (sMsg, callback) => {

  if (typeof callback === "function") {
    callback(confirm(sMsg));
  }

  return;


  var bReturn = false;
  var title = "확인";
  var type = "";

  //중복방지
  if (___bConfirmDupChk) return;
  ___bConfirmDupChk = true;

  //"<b>Alert</b>\n Application Call dialog push"
  if (gfn_isNull(sMsg)) sMsg = "";

  dialog.push({
    type: type
    , title: title
    , body: sMsg
    , buttons: [
      {
        buttonValue: "Yes"
        , buttonClass: "Blue"
        , onClick: function () {
          ___bConfirmDupChk = false;
          bReturn = true;

          if (typeof callback === "function") {
            callback(bReturn);
          }
        }
      },
      {
        buttonValue: "No"
        , buttonClass: "" //"Blue"
        , onClick: function () {
          ___bConfirmDupChk = false;
          bReturn = false;

          if (typeof callback === "function") {
            callback(bReturn);
          }
        }
      }
    ]
  });

  return bReturn;
};
/*********************************************************
 * NAME   : gfn_SetSearchDatePicker
 * DESC   : 검색 조건 date picker 날짜 세팅
 * PARAM  :
 *        period: 개월수 (optional: default: 3개월 )
 *        startObj: 시작 element id (optional: default: 'search_start_dt')
 *        endObj: 종료 element id (optional: default: 'search_end_dt')
 *        baseDateStr: 기준일 YYYYMMDD 형식 ( optional:  default: 오늘 )
 * RETURN :
 *
 * 2025-02-03  성은호  최초 작성
 *********************************************************/

const gfn_SetSearchDatePicker = (period, startElId, endElId, baseDateStr) => {
  if (gfn_isNull(period) || !gfn_isNum(period)) {
    period = DEFAULT_SEARCH_PERIOD;
  }

  if (gfn_isNull(startElId)) {
    startElId = "search_start_dt";
  }

  if (gfn_isNull(endElId)) {
    endElId = "search_end_dt";
  }

  let $startDtEl = $("#" + startElId);
  let $endDtEl = $("#" + endElId);

  if ($startDtEl.length == 0 || $endDtEl.length == 0) {
    return;
  }

  if (!gfn_isFunction("datetimepicker")) {
    return;
  }
  $startDtEl.datetimepicker({
    datepicker: true, timepicker: false
    , format: "Y" + "-" + "m" + "-" + "d"
  });
  $endDtEl.datetimepicker({
    datepicker: true, timepicker: false
    , format: "Y" + "-" + "m" + "-" + "d"
  });
  let baseDate;
  if (gfn_isNull(baseDateStr) || !gfn_isValidDate(baseDateStr)) {
    baseDate = new Date();
  } else {
    const dateRegExp = /(\d{4})(\d{2})(\d{2})/;
    const match = baseDateStr.match(dateRegExp);

    if (!match) return false;
    const [_, year, month, day] = match;
    baseDate = new Date(`${year}-${month}-${day}`);
  }

  let endDate = baseDate.getFullYear() + DATE_SEPERATOR + gfn_LPad(2, baseDate.getMonth() + 1) + DATE_SEPERATOR
    + gfn_LPad(2, baseDate.getDate());

  baseDate.setMonth(baseDate.getMonth() - period);
  let startDate = baseDate.getFullYear() + DATE_SEPERATOR + gfn_LPad(2, baseDate.getMonth() + 1) + DATE_SEPERATOR
    + gfn_LPad(2, baseDate.getDate());

  $startDtEl.val(startDate);
  $endDtEl.val(endDate);
};
/*********************************************************
 * NAME   : [TODO] clearFrmSearchBox
 * DESC   : 검색 조건 초기화
 * PARAM  :
 * RETURN :
 *
 * 2025-02-03  성은호  최초 작성
 *********************************************************/
const gfn_clearFrmSearchBox = () => {


};


/*********************************************************
 * NAME   : gfn_isNull(str)
 * DESC   : NULL 또는 빈 문자열인지 체크하여 true/false 를 리턴한다.
 * PARAM  : str         : 체크할 문자열
 * RETURN : rtnObj      : json Object
 * 호출예시 : gfn_isNull(str);
 *
 * 2025.01.22  김동현  최초 작성
 *********************************************************/
const gfn_isNull = (str) => {
  if (str == null)
    return true;
  if (['undefined', 'NaN', 'null'].includes(str))
    return true;
  return !new String(str).toString().trim();
}
/*********************************************************
 * NAME   : gfn_isFunction
 * DESC   : 공통 - 함수 존재여부
 * PARAM  :
 *        func: 함수ID(String)
 * RETURN : boolean
 *
 * 2025-02-03  성은호  최초 작성
 *********************************************************/
const gfn_isFunction = (func) => {
  if (gfn_isNull(func)) {
    return false;
  }

  if (typeof ($.fn[func]) == "function" || typeof (func) == "function") {
    //함수존재
    return true;
  }

  return false;
};
const gfn_isNum = (s) => {
  //숫자형문자여부
  try {
    return (s == new String(parseFloat(s)) ? true : false);
  } catch (e) {
    return false;
  }
};


function gfn_date(sId , form ){
  if( form != undefined && form != null )
    $(form).find('#'+sId).trigger("focus");
  else
    $('#'+sId).trigger("focus");
}
/*********************************************************
 * NAME   : gfn_GetColumnData()
 * DESC   : 그리드(IBSheet) 레이아웃을 생성한다.
 * 			.loadSearchData(json데이터)로 데이터 출력 및 갱신
 * PARAM  : elId	- 그리드 출력할 Dom Id
 *          cols	- 컬럼 정보 배열
 *          options	- 부가 옵션(필수값 아님)
 * RETURN : 그리드 객체
 *
 * 2024.12.24  김동현  최초 작성
 *********************************************************/
function gfn_GetColumnData(elId) {
  const result = {};
  const area = document.getElementById(elId);
  if (!area) {
    console.error(`element with id "${elId}" not found`);
    return result;
  }
  const elements = area.querySelectorAll('input[data-col-id], select[data-col-id]');
  elements.forEach((el) => {
    const colId = el.dataset.colId;
    if (colId) {
      result[colId] = el.value;
    }
  });
  return result;
};

function gfn_ClearColumnData(elId, options = {
  exclusions: [],
}) {
  const area = document.getElementById(elId);
  if (!area) {
    console.error(`element with id "${elId}" not found`);
    return;
  }
  const inputs = area.querySelectorAll('input[data-col-id]');
  inputs.forEach(el => {
    if (!options.exclusions.includes(el.dataset.colId)) {
      el.value = '';
    }
  });
  const selects = area.querySelectorAll('select[data-col-id]');
  selects.forEach(el => {
    const option = el.querySelector('option');
    if (option) {
      el.value = option.value;
    }
  });
};


/*********************************************************
 * Properties Toggle
 * 손영식 , 2018.07.23
 *
 * ex)
 *      $(selector).toggleAttr("required");
 *      $(selector).toggleAttr("required", true);
 *      $(selector).toggleAttr("required", false);
 *
 ******************************************************** */
$.fn.extend({
  toggleAttr: function (attr, turnOn) {
    var justToggle = (turnOn === undefined);
    return this.each(function () {
      if ((justToggle && !$(this).is("[" + attr + "]")) ||
        (!justToggle && turnOn)) {
        $(this).attr(attr, attr);
      } else {
        $(this).removeAttr(attr);
      }
    });
  }
});






/*********************************************************
 * NAME   : gfn_SetIframeAutoHeightDefault(iframeId, heightOffset)
 * DESC   : iframe의 높이를 설정한다.
 *          window resize, 최초 iframe 로딩 후 등 iframe 내부 컨텐츠에 따라 높이가 자동 조절된다.
 * PARAM  : iframeId	  : iframe id
 *          heightOffset  : 하단 여백 offset
 *
 * 2025.2.14  장민훈  최초 작성
 *********************************************************/
function gfn_SetIframeAutoHeightDefault(iframeId, heightOffset) {
  var windowResizeFunction = function (resizeFunction, iframe) {
    $(window).resize(function () {
      resizeFunction(iframe);
    });
  };

  var height = heightOffset;
  if (typeof (height) == "undefined" && height == null) {
    height = 0;
  }

  $('#' + iframeId).iframeAutoHeight({
    heightOffset: height
    , triggerFunctions: [
      windowResizeFunction
    ]
  });

};

/*********************************************************
 * NAME   : gfn_GetSysCodeList(pGrpCd)
 * DESC   : 공통코드를 조회하여 리턴한다.(동기식 호출)
 * PARAM  : pGrpCd	  : 공통그룹코드 (예:APRV_LINE_APRV_LINE_CND)
 *
 * 2025.2.26  김태호  최초 작성
 *********************************************************/
function gfn_GetSysCodeList(pPjtCd, pGrpCd){
  let rtnData;
  $.ajax({
    type: 'GET',
    data: { grpCd: pGrpCd },
    url: '/api/cmn/system/selectCodeList',
    dataType: 'JSON',
    async : false ,
    success: function(data, status, xhr){
      //console.log(">>>>>" + JSON.stringify(data));
      rtnData =  data;
    }
  }).done(console.log);
  return rtnData;
}

/*********************************************************
 * NAME   : gfn_SetCodeComboBind(pSelectId,pPjtCd,pGrpCd,sKindNm)
 * DESC   : 공통코드를 조회하여 Select Box에 출력한다.
 * PARAM  : [필수] pSelectId  : Select Box ID (String)
 *          [필수] pGrpCd     : 공통그룹코드 (예:APRV_LINE_APRV_LINE_CND)
 * 			[선택] sKindNm    : 기타 조건이 많아 Name 입력된 값으로 설정됨(value는 '' 임)
 * 예제 : gfn_SetCodeComboBind("selSample","0000","TRADE","─── All ───")
 * 2025.2.26  김태호  최초 작성
 *********************************************************/
function gfn_SetCodeComboBind(pSelectId, pPjtCd, pGrpCd, sKindNm){
  if(gfn_isNull(pSelectId)) return false;
  let sOption = "";

  //sKindNm (선택/전체/기타조건 등등)
  if (!gfn_isNull(sKindNm) || sKindNm == " ") {
    sOption += "<option value=''>" + sKindNm + "</option>"
  }

  $.ajax({
    type: 'GET',
    data: { pjtCd:pPjtCd, grpCd:pGrpCd },
    url: '/api/cmn/system/selectCodeList',
    dataType: 'JSON',
    success: function(data, status, xhr){
      if(!gfn_isNull(data) && data.length > 0){
        for(var i = 0; i < data.length;i++) {
          sOption += "<option value='" + data[i].detlCd + "'> " + data[i].detlCdNm + "</option>";
        }
      }
      $('#' + pSelectId).attr("data-combo_grpcd",pGrpCd);
      $('#' + pSelectId).html(sOption);
    }
  }).done(console.log);

  return true;
}

/*********************************************************
 * NAME   : gfn_SetCodeComboJoinBind(pSelectId,pPjtCd,pGrpCd,sKindNm)
 * DESC   : 공통코드를 조회하여 Select Box에 출력한다.
 * PARAM  : [필수] pSelectId  : Select Box ID (String)
 *          [필수] pGrpCd     : 공통그룹코드 (예:APRV_LINE_APRV_LINE_CND)
 * 			[선택] sKindNm    : 기타 조건이 많아 Name 입력된 값으로 설정됨(value는 '' 임)
 * 예제 : gfn_SetComboJoinBind("selSample","0000","TRADE","A","─── All ───")
 * 2025.2.26  김태호  최초 작성
 *********************************************************/
function gfn_SetCodeComboJoinBind(pSelectId, pPjtCd, pGrpCd, pDetlCd, sKindNm){
  if(gfn_isNull(pSelectId)) return false;
  let sOption = "";

  //sKindNm (선택/전체/기타조건 등등)
  if (!gfn_isNull(sKindNm) || sKindNm == " ") {
    sOption += "<option value=''>" + sKindNm + "</option>"
  }

  $.ajax({
    type: 'GET',
    data: { pjtCd:pPjtCd, grpCd:pGrpCd, detlCd:pDetlCd },
    url: '/api/sys/code/selectCmnCodeJoinList',
    dataType: 'JSON',
    success: function(data, status, xhr){
      let sJoinGrpCd = "";
      if(!gfn_isNull(data) && data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          sJoinGrpCd = data[i].joinGrpCd;
          sOption += "<option value='" + data[i].detlCd + "'> " + data[i].detlCdNm + "</option>";
        }
      }
      $('#' + pSelectId).attr("data-combo_grpcd",sJoinGrpCd);
      $('#' + pSelectId).html(sOption);
    }
  }).done(console.log);

  return true;
}

/*********************************************************
 * NAME   : gfn_OpenModalAjax(options)
 * DESC   : Ajax 모달 출력
 * PARAM  : [필수] url		: 호출 url
 * 		  : [필수] title	: 제목
 * 			options {
 *              [선택] type		: 기본값 GET
 *              [선택] data		: Object 타입 form data
 *          }
 * RETURN : void
 *
 * 2025.3.4  김동현  최초 작성
 *********************************************************/
async function gfn_OpenModalAjax(url, title, {type = 'GET', data = {}, callback = null} = {}) {
  const html = await $.ajax({
    url, type, data,
  });
  const domId = 'modal-' + new Date().getTime();
  $('body').append(`<div id="${domId}" style="display: none"></div>`);

  $(`#${domId}`).html(html).dialogPopup({
    title,
    close() {
      if (callback) callback();
    },
  });
}

/*********************************************************
 * NAME   : gfn_OpenModalDom(domId, options)
 * DESC   : DOM ID 영역을 모달 출력
 * PARAM  : [필수] domId		: DOM ID
 *          [필수] title		: 제목
 *          options {
 *              [선택] callback	: 닫을 때 실행할 함수
 *          }
 * RETURN : void
 *
 * 2025.3.4  김동현  최초 작성
 *********************************************************/
function gfn_OpenModalDom(domId, title, {callback = null} = {}) {
  $(`#${domId}`).dialogPopup({
    title,
    close() {
      if (callback) callback();
    },
  });
}