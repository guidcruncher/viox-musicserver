-- Crossfade duration in seconds
local fade_time = 0.75

local librespot = "librespot_sink"
local symphonia = "symphonia_sink"

local active = nil

function fade(from, to)
  if from then
    from:set_control("volume", 0.0, fade_time)
  end
  if to then
    to:set_control("volume", 1.0, fade_time)
  end
end

function get_node(name)
  return Node("node.name = " .. name)
end

local gain_librespot = Node("node.name = gain_librespot")
local gain_symphonia = Node("node.name = gain_symphonia")

subscribe {
  type = "node",
  callback = function(n)
    local name = n.properties["node.name"]
    local state = n.properties["node.state"]

    if name == librespot and state == "running" then
      if active ~= librespot then
        fade(gain_symphonia, gain_librespot)
        active = librespot
      end
    end

    if name == symphonia and state == "running" then
      if active ~= symphonia then
        fade(gain_librespot, gain_symphonia)
        active = symphonia
      end
    end
  end
}
