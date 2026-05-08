--- ci/lib.sh.orig
+++ ci/lib.sh
@@ -63,6 +63,7 @@
   osname=$OS
   case $osname in
     macos) osname=darwin ;;
+    freebsd) osname=linux ;;
     windows) osname=win32 ;;
   esac
   echo "$osname"
