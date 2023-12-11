import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;
import java.util.Comparator;

public class RequireMatrixBuilder {

    public static void main(String[] args) {
        String basePath = "folders";
        List<String[]> requireMatrix = buildRequireMatrix(basePath);

        Collections.sort(requireMatrix, new PathContainComparator());

        printMatrix(requireMatrix);
    }

    private static List<String[]> buildRequireMatrix(String basePath) {
        List<String[]> requireMatrix = new ArrayList<>();
        traverseFiles(basePath, requireMatrix);
        return requireMatrix;
    }

    private static void traverseFiles(String path, List<String[]> requireMatrix) {
        File directory = new File(path);
        File[] files = directory.listFiles();

        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    traverseFiles(file.getAbsolutePath(), requireMatrix);
                } else {
                    String filePath = file.getAbsolutePath();
                    List<String> requireLines = extractRequireLines(filePath);

                    if (!requireLines.isEmpty()) {
                        String[] row = new String[requireLines.size() + 1];
                        row[0] = filePath;
                        for (int i = 0; i < requireLines.size(); i++) {
                            row[i + 1] = requireLines.get(i);
                        }
                        requireMatrix.add(row);
                    } else {
                        requireMatrix.add(new String[]{filePath});
                    }
                }
            }
        }
    }

    private static List<String> extractRequireLines(String filePath) {
        List<String> requireLines = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().startsWith("require")) {
                    requireLines.add(extractFolderAndFile(line.trim()));
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return requireLines;
    }

    public static String extractFolderAndFile(String input) {
        String[] parts = input.split("‘|’");

        String result = parts.length > 1 ? parts[1] : null;

        return result;
    }

    private static boolean containsAny(String filePath, String[] row) {
        for (int i = 1; i < row.length; i++) {
            if (filePath.contains(row[i])) {
                return true;
            }
        }
        return false;
    }
    
    private static void printMatrix(List<String[]> matrix) {
        for (String[] row : matrix) {
            for (String cell : row) {
                System.out.print(cell + "\t");
            }
            System.out.println();
        }
    }

    private static class PathContainComparator implements Comparator<String[]> {
        @Override
        public int compare(String[] row1, String[] row2) {
            String filePath1 = row1[0];
            String filePath2 = row2[0];

            if (containsAny(filePath1, row2)) {
                return 1;
            } else if (containsAny(filePath2, row1)) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
