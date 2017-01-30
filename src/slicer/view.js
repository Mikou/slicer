var Pikaday = require('pikaday');

var labels;

module.exports = function (opts) {
    var defaultLabels = {
      title: "calendar",
      from: "from",
      to:   "to",
      submit: "find time slices",
      buttonPrev: "<<",
      buttonNext: ">>",
			noDataFound: "No data was found for the requested date.",
      monthLitterals: ["January", "February", "March", "April", 
      "May", "June", "July", "August", "September", "October", "November", "December"]
    };

  	var stylesheet;
    var primaryColor = opts.color || '#ee8';
    labels = (opts.labels) ? merge(defaultLabels, opts.labels) : defaultLabels;
		var document   = opts.document || document;
    var $slicer    = opts.document.createElement("div");
    var $header    = opts.document.createElement("div");
    var $footer    = opts.document.createElement("div");
    var $content   = opts.document.createElement("div");
    var $title     = opts.document.createElement("h1");
    var $textNode  = opts.document.createTextNode(labels.title || "undefined");
    var formatTime = opts.formatTime || _formatTime;
    var formatDate = opts.formatDate || _formatDate;
    var formControls = createForm($footer);
    
    $title.appendChild($textNode);
    $header.appendChild($title);
    if(!opts.hideTitle) {
      $slicer.appendChild($header);
    }
    $slicer.appendChild($footer);
    $slicer.appendChild($content);

    opts.container.appendChild($slicer);

    function collapsible(e) {
      e = e || window.event;
      var from = e.target || e.srcElement;
      if (!/^li$/i.test(from.nodeName) || !from.querySelectorAll('li').length) {
        return true;
      }
      var expand = hasClass(from, 'collapse');
			if(expand) {
				removeClass(from, 'collapse');
				addClass(from, 'expand');
			} else {
				removeClass(from, 'expand');
				addClass(from, 'collapse');
			}
    }

		function applySkin () {
		  var style = getStylesheet();
      style.innerHTML = new String() +
        '#slicer {padding:0; margin:0}' +
        '#slicer li.expand {background: ' + primaryColor + '}' +
        '#slicer li.expand ul {background: #eee}' +
        '#slicer li.expand ul {line-height:25px}' +
        '#slicer li.expand ul {text-indent:0px}' +
        '#slicer li {cursor: pointer; list-style:none; line-height:54px; text-indent:16px; border-top:1px solid #ddd; position: relative' +
        '    -webkit-transition: all 0.3s ease;' +
        '    -o-transition: all 0.3s ease;' +
        '    transition: all 0.3s ease;' +
        '}' +
        '#slicer li.expand li:hover {' +
        '  color: #e44;' +
        '}' +
        '#slicer .collapsible.collapse::before {content: "+"}' +
        '#slicer .collapsible.expand::before {content: "-"}' +
        '#slicer li.collapse ul {display:none}'
      ;
		}

    function displaySlides (slices, container) {
      var rootKeyName = opts.rootKeyName || "timeslices";

      container.innerHTML = "";
      if(isEmpty(slices[rootKeyName])) {
        $noSlices = document.createElement('div');
        addClass($noSlices, 'slider-no-slices');
        $noSlices.appendChild(document.createTextNode(labels.noDataFound));
        container.appendChild($noSlices);
        return;
      }
      formControls.deactivateSubmit();      
      formControls.setInputValue(slices.from);
      $slices = document.createElement('ul');
			$slices.id = "slicer";
      container.appendChild($slices);


      for(d in slices[rootKeyName]) {
        var hours = slices[rootKeyName][d];
        d = new Date(d);
        var $day = document.createElement('li');
				addClass($day, 'slicer-day');
				addClass($day, 'collapsible');
				addClass($day, 'collapse');
        $day.addEventListener('click', collapsible);
        var formatedDate = formatDate(d);
        var textNode = document.createTextNode(formatedDate);
        var $hours = document.createElement('ul');
        $hours.className = "slicer-hours";
        $day.appendChild(textNode);
        $day.appendChild($hours);
        $slices.appendChild($day);
        for(h in hours) {
          hours[h].from = new Date(hours[h].from);
          hours[h].to = new Date(hours[h].to);
          var formatedFromDate = formatTime(hours[h].from);
          var formatedToDate   = formatTime(hours[h].to);
          var textNode = document.createTextNode(labels.from + ": " + formatedFromDate + ", " + labels.to + ": " + formatedToDate);
          var $hour = document.createElement('li');
          $hour.addEventListener("click", function(e) {
            opts.internal.onSelectSlot(e, opts.onSelectSlot);
          });
          $hour.className = "slicer-hour";
          $hour.setAttribute("data-slot", hours[h].from.toISOString());
          $hour.appendChild(textNode);
          $hours.appendChild($hour);
        }
      }
    }

    function createForm(container) {
      var $form = opts.document.createElement("form");
      $form.addEventListener("submit", function (e) {
        e.preventDefault();
        e = e || window.event;
        var $selectDate = e.srcElement[1];

        var selectedDate = $selectDate.value;

        opts.internal.onCustomDateSelected(selectedDate);
      });
      var $controls = opts.document.createElement("div");
      $controls.class="slicer-controls";
      var $inputContainer = opts.document.createElement("span");
      var $moveLeft = opts.document.createElement("input");
      $moveLeft.type = "button";
      $moveLeft.value = labels.labelButtonPrev || "<<";
      $moveLeft.addEventListener("click", function(e) {
        opts.internal.onMoveLeft(e, opts.onSelectSlot);
      });
      var $input = opts.document.createElement("input");
      $input.id = "selectedDate";
      $input.type = "text";
      var $moveRight = opts.document.createElement("input");
      $moveRight.type = "button";
      $moveRight.value = labels.labelButtonNext || ">>";
      $moveRight.addEventListener("click", function(e) {
        opts.internal.onMoveRight(e, opts.onSelectSlot);
      });

      var $submit = opts.document.createElement("input");
      $submit.type = "submit";
      $submit.value = labels.submit;
      $submit.disabled = true;

      $inputContainer.appendChild($input);
      $inputContainer.appendChild($submit);

      $controls.appendChild($moveLeft);
      $controls.appendChild($inputContainer);
      $controls.appendChild($moveRight);

      $form.appendChild($controls);
      
      container.appendChild($form);
      var picker = new Pikaday({ 
        field: $input,
        onSelect: function(date) {
          $input.value = formatDate(date);  
          $submit.disabled = false;
        },
        minDate: new Date()
      });

      return {
        setInputValue: function(value) { $input.value = formatDate(value) },
        activateSubmit: function() { $submit.disabled = false },
        deactivateSubmit: function() { $submit.disabled = true },
        activatePrev: function () { $moveLeft.disabled = false },
        deactivatePrev: function () { $moveLeft.disabled = true }
      }
    }
		function getStylesheet() {
			if(!stylesheet) {
			var style = opts.document.createElement("style");
			// WebKit hack :(
			style.appendChild(opts.document.createTextNode(""));
			// Add the <style> element to the page
			opts.document.head.appendChild(style);
			stylesheet = style;
			}
			return stylesheet;
		}
    function displayError (error, container) {
      var textNode = opts.document.createTextNode(error.message);
      container.appendChild(textNode);
    }
    function setContent (type, data) {
      switch(type) {
        case "slices":
          displaySlides(data, $content);
          break;
        case "error":
          displayError(data, $content);
          break;
        default:
          throw new Error("could not resolve the type");
      }
    }
		applySkin(); 
    return {
      setContent: setContent,
      setInputValue: formControls.setInputValue,
      deactivatePrev: function () {
        formControls.deactivatePrev();
      },
      activatePrev: function () {
        formControls.activatePrev();
      }
    };
  }

  /* utils **********************************************/
  function smallerThanTen (value) { return value < 10;}
  function addPrefixIf(prefix, predicate, value) {
    return predicate(value) ? (prefix + "" + value) : value;
  }
  function _formatTime (date) {
    // create new date in order to prevent accidental changes to the passed reference
    date = new Date(date);
    var format = date.getHours() + ":" + addPrefixIf("0", smallerThanTen, date.getMinutes());
    return format;
  }
  function _formatDate (date) {
    // create new date in order to prevent accidental changes to the passed reference
    date = new Date(date);
    var format = date.getDate() + " " + labels.monthLitterals[date.getMonth()] + " " + date.getFullYear();    
    return format;
  }
	function hasClass(el, className) {
		if (el.classList)
			return el.classList.contains(className)
		else
			return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
	}
	function addClass(el, className) {
		if (el.classList)
			el.classList.add(className)
		else if (!hasClass(el, className)) el.className += " " + className
	}
	function removeClass(el, className) {
		if (el.classList)
			el.classList.remove(className)
		else if (hasClass(el, className)) {
			var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
			el.className=el.className.replace(reg, ' ')
		}
	}
  function merge(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
  }
	function isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false;
    }
    return JSON.stringify(obj) === JSON.stringify({});
	}
