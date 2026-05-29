MRuby::Build.new("robert") do |conf|
  mruby_dir = File.expand_path(ENV.fetch("MRUBY_DIR"))

  conf.toolchain
  conf.linker.flags << "-lcurl -lmbedtls"
  conf.cc.include_paths << File.join("/usr/local", "include")
  conf.linker.library_paths << File.join("/usr/local", "lib")

  conf.gembox "default"
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-termbox2")
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-tui")
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-tui-chat")
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-markdown")
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-http")
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-curl")
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-json")
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-stringio")
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-process")
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-llm")
  conf.gem File.join(mruby_dir, "mrbgems", "mruby-command")
  conf.gem File.expand_path(__dir__)
  conf.cc.flags << "-DNDEBUG"
end
