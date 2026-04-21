#pragma once

#include <string>

namespace moe {

struct CompileResult {
  bool ok;
  std::string json;
  std::string error;
};

CompileResult CompileLuauToTuesdayJson(const std::string& source);

}  // namespace moe

