/* dendry
 * http://github.com/idmillington/dendry
 *
 * MIT License
 */
/*jshint indent:2 */
(function() {
  'use strict';

  var _contentObjectToLaTeX = function(contentObj) {
    if (contentObj.type === undefined) {
      return contentObj.replace('$', '\\$').
                        replace('{', '\\{').replace('}', '\\}');
    } else {
      switch (contentObj.type) {
      case 'emphasis-1':
        return '\\textit{' + _contentToLaTeX(contentObj.content) + '}';
      case 'emphasis-2':
        return '\\textbf{' + _contentToLaTeX(contentObj.content) + '}';
      case 'hidden':
        return _contentToLaTeX(contentObj.content);
      case 'line-break':
        return '\\\\\n';

      // We can't handle elements that require state-dependency.
      case 'insert':
        /* falls through */
      case 'conditional':
        throw new Error(
          contentObj.type + ' should have been evaluated by now.'
          );
      }
    }
  };

  var _contentToLaTeX = function(content) {
    var result;
    if (Array.isArray(content)) {
      result = [];
      for (var i = 0; i < content.length; ++i) {
        var contentObj = content[i];
        result.push(_contentObjectToLaTeX(contentObj));
      }
      result = result.join('');
    } else {
      result = _contentObjectToLaTeX(content);
    }
    return result;
  };

  // Matches paragraph types 'heading-1' through 'heading-6', capturing
  // the level digit.
  var _headingRe = /^heading-([1-6])$/;

  // dendry heading levels 1-6 map onto LaTeX's five unnumbered
  // sectioning commands. LaTeX has nothing smaller than
  // \subparagraph, so levels 5 and 6 both use it.
  var _headingCommands = {
    '1': 'section',
    '2': 'subsection',
    '3': 'subsubsection',
    '4': 'paragraph',
    '5': 'subparagraph',
    '6': 'subparagraph'
  };

  var _paragraphsToLaTeX = function(paragraphs) {
    var result = [];
    for (var i = 0; i < paragraphs.length; ++i) {
      var paragraph = paragraphs[i];
      var headingMatch = _headingRe.exec(paragraph.type);
      if (headingMatch) {
        var command = _headingCommands[headingMatch[1]];
        result.push('\\' + command + '*{');
        result.push(_contentToLaTeX(paragraph.content));
        result.push('}\n\n');
        continue;
      }
      switch (paragraph.type) {
      case 'paragraph':
        result.push(_contentToLaTeX(paragraph.content));
        result.push('\n\n');
        break;
      case 'quotation':
        result.push('\\begin{quote}');
        result.push(_contentToLaTeX(paragraph.content));
        result.push('\\end{quote}\n\n');
        break;
      case 'attribution':
        result.push('\\begin{quote}');
        result.push(_contentToLaTeX(paragraph.content));
        result.push('\\end{quote}\n\n');
        break;
      case 'hrule':
        result.push('* * *\n\n');
        break;
      }
    }
    return result.join('');
  };

  module.exports = {
    convert: _paragraphsToLaTeX,
    convertLine: _contentToLaTeX
  };
}());
