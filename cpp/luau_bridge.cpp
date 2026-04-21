#include "luau_bridge.h"

namespace moe {

CompileResult CompileLuauToTuesdayJson(const std::string& source) {
  return {.ok = false, .json = "", .error = "Luau bridge not implemented: " + source};
}

}  // namespace moe

