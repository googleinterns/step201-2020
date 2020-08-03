package com.google.step.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.jsoup.Jsoup;
import org.jsoup.helper.Validate;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;


/** Servlet responsible for People Search & email sending. */
@WebServlet("/~who/*")
public class PeopleSearchServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String[] requestUrls = request.getRequestURI().split("/");
    if (requestUrls.length < URL_MIN_LENGTH) {
      response.getWriter().println("Invalid input");
      return;
    }
    Document doc = Jsoup.connect("https://directory.columbia.edu/people/search?filter.searchTerm=" + requestUrls[2]).get();
    Elements emails = doc.select("a[class='mailto']");
    if (emails.isEmpty()) {
      response.getWriter().println("<p>No result</p>");
      response.getWriter().println("<a href=\"/index.html\">Back</a>");
    } else if (emails.size() == 1 ) {
      response.sendRedirect("mailto:" + emails.first().html());
    } else {
      String returnStr = "<h1 style='text-align: center'>Possible Email Addresses</h1>";
      for (Element email : emails) {
        returnStr += "<a class=\"table-container\" href=\"mailto:" + email.html() + "\">" + email.html() + "</a><br>";
      }
      response.getWriter().println(returnStr);
    }
  }

  // The minimum valid length for a navigation URL
  private static final int URL_MIN_LENGTH = 3;
}