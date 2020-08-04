package com.google.step.servlets;

import java.io.IOException;
import java.io.PrintWriter;
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
    PrintWriter out = response.getWriter();
    if (requestUrls.length < URL_MIN_LENGTH) {
      out.println("Invalid input");
      return;
    }
    
    Document doc = Jsoup.connect("https://directory.columbia.edu/people/search?filter.searchTerm=" 
                     + requestUrls[2]).get();
    Elements emails = doc.select("a[class='mailto']");
    if (emails.size() == 1) {
      // Redirect to the composing page if the exact email is found
      response.sendRedirect("mailto:" + emails.first().html());
    } else {
      out.println("<html>");
      out.println("<head>");
      out.println("<title>Search Result</title>");
      out.println("<link rel='stylesheet' type='text/css' href='../style.css'>");
      out.println("<script src='../script.js'></script>");
      out.println("</head>");
      out.println("<body>");
      if (emails.isEmpty()) {
        out.println("<p class='signal'>No result</p>");
        out.println("<button onclick='redirectToHomePage()' type='button'>Back</button>");
      } else {
        // Display all matching emails if more than one are found
        out.println("<h1 style='text-align: center'>Possible Email Addresses</h1>");
        out.print("<button onclick='redirectToHomePage()' type='button' class='redirectButton'>");
        out.println("Back</button>");
        out.println("<div class='table-container'>");
        out.println("<table id='link-container'>");
        out.println("<tbody>");
        out.println("<thead><tr><th>Email</th></tr></thead>");
        for (Element email : emails) {
          out.println("<tr><td><a href='mailto:" + email.html() + "'>" + email.html() + "</a></td></tr>");
        }
        out.println("</tbody>");
        out.println("</table>");
        out.println("</div>");
      }
      out.println("</body>");
      out.println("</html>");
    }
  }

  // The minimum valid length for a navigation URL
  private static final int URL_MIN_LENGTH = 3;
}