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
var callbacks = new Map();
var rtnParams = new Map();
const gfn_OpenWindow = (theURL, winName, w, h, callbackObj, option, paramObj) => {
  console.assert(winName);

  let posX = ((screen.width / 2) - (w / 2));
  let posY = ((screen.height / 2) - (h / 2)) - 30;

  let strOption = 'width=' + w + ',height=' + h + ',left=' + posX + ',top=' + posY;
  //scrollbars=no,menubar=no,resizable=no

  const fromName = 'commonPopupForm';

  let $popupForm = $('<form/>').attr('id', fromName).attr('name', fromName).attr('method', 'post');

  if (theURL.indexOf('?') != -1) {
    let arrParams = theURL.split('?');
    theURL = arrParams[0];
    arrParams = arrParams[1];

    if (arrParams.indexOf('&') != -1) {
      arrParams = arrParams.split('&');
    }

    const params = {};
    arrParams.forEach(function (strParamKeyValue) {
      let strParam = strParamKeyValue.split('=');
      let key = strParam[0];
      let value = strParam[1];

      let inpuHtmlTag = '<input type=\'hidden\' name=\'' + key + '\' value=\'' + value + '\'>';
      $popupForm.append(inpuHtmlTag);

      params[key] = value;
    });
    rtnParams.set(winName, params);
  } else {
    if (typeof (paramObj) === 'object') {
      let paramKeys = Object.keys(paramObj);

      paramKeys.forEach(function (key) {
        let inpuHtmlTag = '<input type=\'hidden\' name=\'' + key + '\' value=\'' + paramObj[key] + '\'>';
        $popupForm.append(inpuHtmlTag);
      });

      rtnParams.set(winName, paramObj);
    }
  }

  if (!gfn_isNull(option)) {
    strOption = option;
  }

  if (!gfn_isNull(callbackObj)) {
    callbacks.set(winName, callbackObj);
  }

  let rtnWinObj = window.open('', winName, strOption);

  $popupForm.attr('action', theURL);
  $popupForm.attr('target', winName);
  $popupForm.appendTo('body');
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
 * NAME   : gfn_OpenModalAjax(options)
 * DESC   : Ajax 모달 출력
 * PARAM  : [필수] url		: 호출 url
 *      : [필수] title	: 제목
 *      options {
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

function extractBaseUrl(url) {
  return url.split('?')[0];
}

function extractQueryParams(url) {
  if (url.indexOf('?') === -1) return null;
  const [, queryString] = url.split('?');
  return queryString.split('&').reduce((acc, cur) => {
    const [key, value] = cur.split('=');
    acc[key] = value;
    return acc;
  }, {});
}

function appendFormParams($form, params = {}) {
  Object.entries(params).forEach(([key, value]) => {
    $form.append(`<input type="hidden" name="${key}" value="${value}">`);
  });
}


//gfn_OpenWindow를 개량, popup 또는 modal로 띄울 수 있도록 수정
(() => {
  const callbackInfo = new Map();

  function openPopup({url, params, winName, width, height, callback, popupOptions = {}}) {
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2 - 30;
    popupOptions = {...popupOptions, width, height, left, top};
    const strOptions = Object.entries(popupOptions).map(([key, value]) => `${key}=${value}`).join(',');
    const $form = $(`<form action="${extractBaseUrl(url)}" method="post" target="${winName}"></form>`);
    const queryParams = extractQueryParams(url);
    params = queryParams || params;
    appendFormParams($form, params);
    if (callback) {
      callbackInfo.set(winName, {
        callback,
        calledParams: params,
      });
    }
  }

  const 오픈함수 = function ({
            url,
            params,
            winName,
            title,
            withs,
            height,
            openType,
            callback,
            popupOptions = {},
            modalOptions = {},
          }) {
    if (openType === 'popup') {
      openPopup({url, params, winName, withs, height, callback, popupOptions});
    }
  };
  window.최종호출함수 = 오픈함수;

  const 콜백함수 = function (winName, returnParams) {
    const {callback, calledParams} = callbackInfo.get(winName);
    const rtnObj = {calledParams, returnParams};

    if (typeof callback === 'function') {
      callback(rtnObj);
    } else if (callback === 'string') {
      eval(callback)(rtnObj);
    }
  }
  window.콜백함수 = 콜백함수;
})();

function 팝업창에서콜백호출(returnParams) {
  window.opener.콜백함수(window.name, returnParams);
}
