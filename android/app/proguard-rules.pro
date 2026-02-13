# 超級保留：防止任何反射/橋接相關被優化
-keep class com.reactnativeimagecolors.** { *; }
-keepclassmembers class com.reactnativeimagecolors.** { *; }
-keepattributes InnerClasses,EnclosingMethod,Signature,Exceptions,*Annotation*

-keep class com.facebook.react.bridge.** { *; }
-keepclassmembers class com.facebook.react.bridge.** { *; }
-dontwarn com.facebook.react.bridge.**

# 保留所有 Dynamic / Readable / Writable 相關（你的錯誤核心）
-keep class com.facebook.react.bridge.Dynamic** { *; }
-keep class com.facebook.react.bridge.Readable** { *; }
-keep class com.facebook.react.bridge.Writable** { *; }
-keepclassmembers class * extends com.facebook.react.bridge.ReactContextBaseJavaModule { *; }

# 通用 native module 保留
-keep class * extends com.facebook.react.bridge.ReactContextBaseJavaModule { *; }
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }

# 防止 R8 移除 enum / 反射常用東西
-keepclassmembers enum * { *; }
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}
