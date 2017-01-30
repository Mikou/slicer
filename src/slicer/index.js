var viewService = require('./view');

module.exports = function (opts) {
  if(!opts.document)
    throw new Error("please, provide a 'document' object");  
  if(!opts) 
    throw new Error("missing arguments");
  if(!opts.container) 
    throw new Error("you must provide a container");
  if(!opts.endpoint) 
    throw new Error("you must provide an endpoint");
  if(!opts.from) 
    throw new Error("you must provide a start date");
  if(!opts.to) 
    throw new Error("you must provide an end date");
  
  opts.internal = {
    onSelectSlot: onSelectSlot,
    onMoveLeft: onMoveLeft,
    onMoveRight: onMoveRight,
    onCustomDateSelected: onCustomDateSelected
  }
  
  var view = viewService(opts);
	var xhr = opts.xhr || window.XMLHttpRequest;
  
  var to = opts.to || (from + (7*3));
  var today = new Date();
  tryDeactivateLeft(from);
  function buildParams(from, to, method) {
    if(method = 'GET') {
      params = "from=" + encodeURIComponent(from.toISOString()) + "&to=" + encodeURIComponent(to.toISOString());
      return params;
    } else {
      throw new Error("Not yet implemented");
    }
  }
  function sendRequest(method, params, successCb, errorCb) {
    var xhttp = new xhr();
    xhttp.onreadystatechange = function () {
      if(this.readyState == 4) {
        if (this.status == 200) {
          successCb(this.responseText);
        } else {
          errorCb(this.responseText);
        }
      }
    }
    var path = (params) ? (opts.endpoint +"?" + params) : opts.endpoint;
    xhttp.open(method, path, true);
    xhttp.send();
  }

	function retrieveSlices(_from, _to, successCb, errorCb, method) {
    var method = method || 'GET';
    var params = buildParams(_from, _to, method);
    from = _from;
    to = _to;
    sendRequest(method, params, successCb, errorCb);
	}

  function onSelectSlot(e, callback) {
    e = e || window.event;
    var from = e.target || e.srcElement;
    if(callback) {
      callback(from.dataset.slot);
    }
  }

  function tryDeactivateLeft (from) {
    if(from <= today)
      view.deactivatePrev();
    else {
      view.activatePrev();
    }
  }

  function onMoveLeft(e, callback) {
    e = e || window.event;
    var element = e.target || e.srcElement;
    var span = daydiff(from, to);
    var newFrom = new Date(from);
    var newTo = new Date(from);
    newFrom.setDate(newFrom.getDate() - span);
    from = newFrom;
    to = newTo;
    tryDeactivateLeft(from);
    retrieveSlices(newFrom, newTo, onRetrieveSlices, onRetrieveSlicesFail, 'GET');
  }

  function onMoveRight(e, callback) {
    e = e || window.event;
    var element = e.target || e.srcElement;
    var span = daydiff(from, to);
    var newFrom = new Date(to);
    var newTo = new Date(to);
    newTo.setDate(newTo.getDate() + span);
    from = newFrom;
    to = newTo;
    tryDeactivateLeft(from);
    retrieveSlices(newFrom, newTo, onRetrieveSlices, onRetrieveSlicesFail, 'GET');
  }

  function onCustomDateSelected(customDate, callback) {
    var customDate = new Date(customDate);
    var span = daydiff(from, to);
    var newFrom = new Date(customDate);
    var newTo = new Date(customDate);
    newTo.setDate(newTo.getDate() + span);
    from = newFrom;
    to = newTo;
    tryDeactivateLeft(from);
    retrieveSlices(newFrom, newTo, onRetrieveSlices, onRetrieveSlicesFail, 'GET');
  }

  function onRetrieveSlices(slices) {
    slices = JSON.parse(slices);
    slices.from = from;
    slices.to = to;
    view.setContent("slices", slices);
  }
  function onRetrieveSlicesFail(err) {
    view.setContent("error", err);
  }
  retrieveSlices(from, to, onRetrieveSlices, onRetrieveSlicesFail, 'GET');
};

/* utils *********************************/
function parseDate(str) {
    var mdy = str.split('/');
    return new Date(mdy[2], mdy[0]-1, mdy[1]);
}
function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}
