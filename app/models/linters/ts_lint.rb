module Linters
  class TSLint < Linters::Base
    def run(file)
      lint_string = IO.popen(cmd(file), 'r+') do |f|
        f.puts file.blob
        f.close_write
        f.read
      end

      begin
        lints = JSON.parse(lint_string).first['messages']
        lints.map do |lint|
          Violation.new(file: file, line: lint['line'], message: lint['message'], linter: Linters::TSLint)
        end
      rescue JSON::ParserError
        [
          Violation.new(
            file: file,
            line: (file.patch.changed_lines.first.number rescue 1),
            message: 'Unexpected error in TSLint',
            linter: Linters::TSLint,
          ),
        ]
      end
    end

    def cmd(file)
      config = @linter_config ? ('-c ' + @linter_config.path) : ''
      <<-CMD.squish
        node_modules/tslint/lib/tslint-cli.js
        #{config}
        -t json
        #{file.path}
        2>&1
      CMD
    end

    def self.config_filename
      'tslint.json'
    end
  end
end

Linters.register(:ts, Linters::TSLint)
