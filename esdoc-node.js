'use strict';

exports.onHandleAST = function(ev) {
  function traverse(ex, callback) {
    callback(ex);
    if (ex.expression) {
      traverse(ex.expression, callback);
    }
  }
  const body = ev.data.ast.body;
  body.forEach((ex) => traverse(ex, (ex) => {
    if (ex.type === 'AssignmentExpression' &&
        ex.operator === '=' && ex.left) {
      const obj = ex.left.object.name;
      const prop = ex.left.property.name;
      if (obj === 'module' && prop === 'exports') {
        let declaration;
        function removeLocation(ex) {
          const newEx = Object.assign({}, ex);
          newEx.loc = null;
          newEx.range = null;
          return newEx;
        }
        // if (ex.right.type === 'MemberExpression') {
        //   declaration = removeLocation(ex.right);
        //   declaration.object = removeLocation(declaration.object);
        //   declaration.property = removeLocation(declaration.property);
        // }
        if (ex.right.type === 'Identifier') {
          declaration = removeLocation(ex.right);
        }
        if (declaration) {
          body.push({
            type: 'ExportDefaultDeclaration',
            declaration
          });
        }
      }
    }
  }));
};
