var newProblemHtml = 
'<div class="problem-container" style="float:none;overflow: hidden"> <!-- container for nav an equation list -->' +
'<div>Problem number <input type="text" class="problem-number"/></div>' +
'<div style="float:left"><!-- container for buttons -->' +
'<p> Actions </p>' +
'<input type="submit" class="next-step" name="next step" value="next step (ctrl-e)"/> <br>' +
'<input type="submit" class="undo-step" name="undo step" value="undo step (ctrl-z)"/> <br>' +
'<input type="submit" class="redo-step" name="redo step" value="redo step (ctrl-shift-z)"/> </br>' +
'</div>' +
'<!-- div to store the steps in the solution -->' +
'<div style="float:left" class="equation-list">' +
'<p> List of expressions </p>' +
'</div>' + 
'</div> <!-- end of one problem container -->';

function newProblem(insertEmptyStep) {
    var newProblemDiv = $(newProblemHtml);
    $('#assignment-container').append(newProblemDiv);
    // object to hold background state as well as DOM references for the
    // new problem
    var newProblemWrapper = (function() {
        // stack with the redo steps in it, use push/pop to modify
        var savedRedoSteps = [];
        // hold references to the mathquill objects for each step
        // (it is not possible to re-mathquillify a DOM element, so
        // they must be tracked after creation to use mathquill methods)
        var currentMqSteps = [];
        var problemWrapperDiv = newProblemDiv;
        
        return { 
            focusLastStep : function() {
                all_spans = problemWrapperDiv.find('.solution-step');
                if (currentMqSteps.length != all_spans.length) alert("internal error, mathquill steps not consistent with DOM");
                currentMqSteps[all_spans.length - 1].focus();
            },
            setProblemNumber : function(problemNumber) {
                var problemNumberText = problemWrapperDiv.find('.problem-number');
                return problemNumberText.val(problemNumber);
            },
            // TODO - more efficient, just set this once in the object whenever the text field is modified
            problemNumber : function() {
                var problemNumberText = problemWrapperDiv.find('.problem-number');
                return problemNumberText.val();
            },
            latexForAllSteps : function() {
                var allSteps = [];
                currentMqSteps.forEach(function(mathField, index, array) {
                    allSteps.push(mathField.latex());
                });
                return allSteps;
            },

            mathquillLast : function() { 
                var all_spans = problemWrapperDiv.find('.solution-step');
                var mq = MathQuill.MathField(all_spans[all_spans.length - 1],mathQuillOpts);
                currentMqSteps.push(mq);
                mq.reflow();
            },

            lastSpan : function() {
                var all_spans = problemWrapperDiv.find('.solution-step');
                return all_spans[all_spans.length - 1]
            },

            newStep : function() {
                savedRedoSteps = [];
                var newLatex = currentMqSteps[currentMqSteps.length - 1].latex();
                var newSpan = $('<span class="solution-step">' + newLatex + '</span><br>');
                problemWrapperDiv.find('.equation-list').append(newSpan);
                this.mathquillLast();
                this.focusLastStep();
            },

            addEquation : function(newLatex) {
                var newSpan = $('<span class="solution-step">' + newLatex + '</span><br>');
                problemWrapperDiv.find('.equation-list').append(newSpan);
                this.mathquillLast();
                this.focusLastStep();
            },

            redoStep : function() {
                if (savedRedoSteps.length == 0) {
                    // hitting the button make the text field lose focus
                    this.focusLastStep();
                    return;
                }
                this.addEquation(savedRedoSteps.pop());
            },

            undoLastStep :  function () {
                var all_spans = problemWrapperDiv.find('.solution-step');
                // do not leave users without a box to type in
                if (all_spans.length == 1) return;
                var lastSpanEl = this.lastSpan();
                lastStepMq = currentMqSteps.pop();
                savedRedoSteps.push(lastStepMq.latex());
                problemWrapperDiv.find('.equation-list').get(0).removeChild(lastSpanEl);
                // remove the <br> tag
                problemWrapperDiv.find('.equation-list br').last().remove();
                this.focusLastStep();
            }
        }
    }());
    problems.push(newProblemWrapper);
    if (insertEmptyStep) {
        setTimeout(function() {
            newProblemWrapper.addEquation('');
            newProblemWrapper.focusLastStep();
        }, 50);
    }
    $(newProblemDiv).keydown(0 /* ignored */, createShortcutKeyHandler(newProblemWrapper));
    newProblemDiv.find('.next-step').click(function() {
        newProblemWrapper.newStep();
    });
    newProblemDiv.find('.undo-step').click(function() {
        newProblemWrapper.undoLastStep();
    });
    newProblemDiv.find('.redo-step').click(function() {
        newProblemWrapper.redoStep();
    });
}
