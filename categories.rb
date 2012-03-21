Dir["_posts/**/*.markdown"].each do |filename|
  File.open(filename, "r+") do |file|
    parse = false
    body = []
    File.readlines(file).each do |line|
      p line
      parse = !parse if line.strip == "---"
      line = line.downcase if parse && line =~ /\A-\s/
      body << line
    end
    file.write(body.join(""))
  end
end
