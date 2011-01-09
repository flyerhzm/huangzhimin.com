module Jekyll
  AOP.around(Site, :site_payload) do |site_instance, args, proceed, abort|
    monthly_archives = []

    site_instance.collated.each do |year, hash|
      hash.each do |month, days|
        monthly_archives << {
          'name'  => "#{Date::MONTHNAMES[month]} #{year}",
          'url'   => "%04d/%02d" % [year.to_s, month.to_s],
          'posts' => days.values.flatten
        }
      end
    end

    result = proceed.call
    result['site']['monthly_archives'] = monthly_archives
    result
  end
end

