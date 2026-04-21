cmake_minimum_required(VERSION 3.22)
project(Moe_luau)

set(CMAKE_CXX_STANDARD 17)

add_library(Moe_luau SHARED
    luau_bridge.cpp
    transpiler/TuesdayEmitter.cpp
)

target_include_directories(Moe_luau PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
)

