require 'sinatra'
require 'nokogiri'
require 'json'

require 'geoip'

require 'net/http'

set :public_folder, './public'

set :server, %w[thin]

URI::DEFAULT_PARSER = URI::Parser.new(:UNRESERVED => URI::REGEXP::PATTERN::UNRESERVED + '|')

WP_API_ENDPOINT = "http://fr.wikipedia.org/w/api.php?"

geoip_db = GeoIP.new('./GeoLiteCity.dat')

get '/api/changes' do
  content_type :json

  # params :from (30 sec ago)
  rcend   = Time.now.utc.strftime("%Y%m%d%H%M%S")
  # params :to
  rcstart     = Time.at(Time.now.to_i - 30).utc.strftime("%Y%m%d%H%M%S")

  api_url = "#{WP_API_ENDPOINT}action=query&list=recentchanges&rcnamespace=0&rclimit=15&rcdir=newer&rcprop=id|user|comment|timestamp|title&rcshow=!bot|anon&rcend=#{rcend}&rcstart=#{rcstart}&format=json"
  resp = Net::HTTP.get_response(URI.parse(api_url))
  data = resp.body

  json = JSON.parse(data)
  json["query"]["recentchanges"].each do |rc|
    begin
      loc_info = geoip_db.city(rc["user"])
      rc['location'] = { 'latitude' => loc_info.latitude, 'longitude' => loc_info.longitude, 'city_name' => loc_info.city_name  }
    rescue
      rc['location'] = {}
    end
  end
  json["query"]["recentchanges"].to_json
end


