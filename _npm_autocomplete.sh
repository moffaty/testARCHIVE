# _npm_autocomplete.sh
#!/bin/bash

_npm_scripts_autocomplete() {
  local word="${COMP_WORDS[COMP_CWORD]}"
  local completions="$(node -e "console.log(Object.keys(require('./package.json').scripts).join(' '))")"
  COMPREPLY=($(compgen -W "$completions" -- "$word"))
}

complete -F _npm_scripts_autocomplete npm