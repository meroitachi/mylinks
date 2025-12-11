"use client";
import { useEffect } from "react";

export default function RedirectPage() {
  useEffect(function () {
    try {
      // Create XHR request (works in all old browsers)
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/links", true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            var redirectItem = null;

            // Old-browser safe loop instead of .find()
            for (var i = 0; i < data.length; i++) {
              if (
                data[i].title &&
                data[i].title.toLowerCase() === "redirect"
              ) {
                redirectItem = data[i];
                break;
              }
            }

            if (redirectItem) {
              var target = redirectItem.url;

              // Ensure URL has http/https
              var httpCheck = /^https?:\/\//i;
              if (!httpCheck.test(target)) {
                target = "https://" + target;
              }

              // UNIVERSAL redirect (works even on ancient browsers)
              window.location.href = target;
            }
          } catch (e) {
            console.log("JSON parse failed:", e);
          }
        }
      };

      xhr.send(); // send request
    } catch (e) {
      console.log("Redirect failed:", e);
    }
  }, []);

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      Redirecting...
    </div>
  );
        }
